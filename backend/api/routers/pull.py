from aiofile import async_open
from asyncssh import PermissionDenied, SFTPClient, SFTPName, SFTPNoSuchFile, SSHClientConnection
from fastapi import APIRouter, Form, status, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from asyncio import get_event_loop
from datetime import datetime
from io import BytesIO
from os import makedirs, remove
from os.path import isdir, join
from typing import Optional
from zipfile import ZipFile

from config import DATA_DIR
from schemas.user import User
from schemas.listdir import ListDir
from utils import get_ssh_session

from ..depends import user_depends
from ..exceptions import (
    AUTHORIZE_FAIL,
    DOWNLOAD_OVERSIZE,
    FILE_NOT_FOUND,
    FILE_OVERSIZE,
    UNKNOW_ERROR,
    UNAUTHORIZE
)
from ..validator import get_user

class PathList(BaseModel):
    path_list: list[str]

def __ls_filter(item: SFTPName, uid: int, file_or_dir: int=1) -> bool:
    if item.attrs.type != file_or_dir:
        return False
    elif item.attrs.uid == uid and bool(item.attrs.permissions & 1 << 8):
        return True
    return bool(item.attrs.permissions & 1 << 2)

async def listdir(
    sftp: SFTPClient,
    uid: int,
    path: str="."
) -> ListDir:
    ls = list(await sftp.readdir(path))
    ls.sort(key=lambda item: item.filename)
    files=list(map(lambda item: item.filename, filter(
        lambda item: __ls_filter(item, uid, 1),
        ls
    )))
    directory=list(map(lambda item: item.filename, filter(
        lambda item: __ls_filter(item, uid, 2),
        ls
    )))
    result = ListDir(
        path=path,
        files=files,
        directory=directory,
    )
    return result

router = APIRouter(
    prefix="/pull",
    tags=["Pull"]
)

@router.websocket("/explorer")
async def explorer_websocket(
    ws: WebSocket,
):
    client: Optional[SSHClientConnection] = None

    try:
        # 驗證使用者
        await ws.accept()
        token = await ws.receive_text()
        user: User = await get_user(token)

        # 連線至伺服器
        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )
        sftp = await client.start_sftp_client()
        uid = int((await client.run("echo $UID")).stdout)

        await ws.send_text("accept")
        path = await ws.receive_text()
        path = await sftp.realpath(path)
        if not await sftp.isdir(path):
            path = await sftp.realpath(f"~")
        while True:
            try:
                result = await listdir(sftp, uid, path)
            except:
                path = await sftp.realpath(f"~")
                result = await listdir(sftp, uid, path)
            await ws.send_json(result.model_dump())
            try:
                selected = await ws.receive_text()
                new_path = await sftp.realpath(f"{path}/{selected}")
                isdir = await sftp.isdir(new_path)
                if isdir:
                    path = new_path
            except SFTPNoSuchFile:
                pass
    except WebSocketDisconnect:
        pass
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except UNAUTHORIZE:
        await ws.close()
        raise UNAUTHORIZE
    except:
        raise UNKNOW_ERROR
    finally:
        if ws.state == WebSocketState.CONNECTED:
            await ws.close()
        if client:
            client.close()

@router.post(
    path="",
    status_code=status.HTTP_201_CREATED
)
async def pull(
    data: PathList,
    user: User = user_depends
) -> str:
    try:
        path_list = data.path_list
        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )
        filesize_sum = 0
        for path in path_list:
            sftp = await client.start_sftp_client()
            isfile = await sftp.isfile(path)
            if not isfile:
                raise FILE_NOT_FOUND
            filesize = await sftp.getsize(path)
            filesize_sum += filesize

        if filesize > 32 * 1024:
            raise FILE_OVERSIZE
        
        user_hash = user.hash_value()

        timestamp = datetime.now().strftime("%Y_%m_%dT%H.%M.%S.%f")
        dir_name = f"{user_hash}-{timestamp}"

        download_dir = join(DATA_DIR, dir_name)

        if not isdir(download_dir):
            makedirs(download_dir)

        for path in path_list:
            raw_filename = path.rsplit('/', 1)[-1]
            await sftp.get(path, join(download_dir, raw_filename))

        return dir_name
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()

@router.post(
    path="/download",
    status_code=status.HTTP_200_OK
)
async def download(
    data: PathList,
    user: User = user_depends
) -> StreamingResponse:
    try:
        path_list = data.path_list
        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )
        filesize_sum = 0
        for path in path_list:
            sftp = await client.start_sftp_client()
            isfile = await sftp.isfile(path)
            if not isfile:
                raise FILE_NOT_FOUND
            filesize = await sftp.getsize(path)
            filesize_sum += filesize

        if filesize > 32 * 1024 * 1024:
            raise DOWNLOAD_OVERSIZE
        
        user_hash = user.hash_value()

        timestamp = datetime.now().strftime("%Y_%m_%dT%H.%M.%S.%f")
        dir_name = f"{user_hash}-{timestamp}"

        if not isdir("download-temp"):
            makedirs("download-temp")
        file_path = join("download-temp", f"{dir_name}.zip")

        file_data: list[tuple[str, bytes]] = []
        for path in path_list:
            raw_filename = path.rsplit('/', 1)[-1]

            async with sftp.open(path, "rb") as remote_file:
                content = await remote_file.read()
            file_data.append((raw_filename, content))
        def __write_to_zip():
            with ZipFile(file_path, "w") as zipfile:
                for filename, content in file_data:
                    zipfile.writestr(filename, content)
        loop = get_event_loop()
        await loop.run_in_executor(None, __write_to_zip)
        async with async_open(file_path, "rb") as df:
            content = await df.read()
        await loop.run_in_executor(None, remove, file_path)
        return StreamingResponse(BytesIO(content))
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()

@router.post(
    path="/edit",
    status_code=status.HTTP_200_OK
)
async def edit(
    file_path: str = Form(),
    user: User = user_depends
) -> str:
    try:
        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )

        sftp = await client.start_sftp_client()
        isfile = await sftp.isfile(file_path)
        if not isfile:
            raise FILE_NOT_FOUND
        filesize = await sftp.getsize(file_path)
        if filesize > 32 * 1024:
            raise FILE_OVERSIZE

        async with sftp.open(file_path, "rb") as remote_file:
            content: bytes = await remote_file.read()
            return content.decode()
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()

@router.post(
    path="/upload",
    status_code=status.HTTP_201_CREATED
)
async def upload(
    files: list[UploadFile],
    remote_path: str = Form(),
    user: User = user_depends
) -> str:
    try:
        total_size = 0
        for file in files:
            total_size += file.size
        if total_size > 32 * 1024 * 1024:
            raise DOWNLOAD_OVERSIZE

        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )

        sftp = await client.start_sftp_client()
        if not await sftp.isdir(remote_path):
            await sftp.makedirs(remote_path)

        for file in files:
            dir_file_list = await sftp.listdir(remote_path)
            new_file_name = file.filename
            i = 1
            while new_file_name in dir_file_list:
                new_file_name = f"{file.filename} ({i})"
                i += 1
            async with sftp.open(f"{remote_path}/{new_file_name}", "wb") as remote_file:
                await remote_file.write(await file.read())
        return remote_path
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()
