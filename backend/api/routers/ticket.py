from aiofile import async_open
from fastapi import APIRouter, Request, status, UploadFile
from fastapi.responses import FileResponse, StreamingResponse

from asyncio import get_event_loop
from datetime import datetime
from io import BytesIO
from logging import getLogger
from os import makedirs, listdir, remove
from os.path import isdir, isfile, join
from zipfile import ZipFile

from config import DATA_DIR
from schemas.user import User
from utils import get_ip, rmtree

from ..depends import ticket_depends, user_depends
from ..exceptions import (
    FILE_NOT_FOUND,
    FILE_OVERSIZE,
    NO_FILE,
    PERMISSION_DENIED
)

LOGGER = getLogger("uvicorn")

route = APIRouter(
    prefix="/ticket",
    tags=["Ticket"],
)

@route.get(
    path="",
    status_code=status.HTTP_200_OK,
)
async def get_all_ticket(
    request: Request,
    user: User=user_depends,
) -> list[str]:
    LOGGER.info(f"User: {user.username}, RemoteIP: {get_ip(request)}")
    if user.admin:
        return listdir(DATA_DIR)
    
    result: list[str] = list(filter(
        lambda file_name: file_name.startswith(user.hash_value()),
        listdir(DATA_DIR))
    )
    return result

@route.post(
    path="",
    status_code=status.HTTP_201_CREATED,
)
async def add_ticket(
    files: list[UploadFile],
    user: User=user_depends,
) -> str:
    if len(files) == 0:
        raise NO_FILE
    if sum(map(lambda file: file.size, files)) > 32 * 1024:
        raise FILE_OVERSIZE
    
    user_hash = user.hash_value()

    timestamp = datetime.now().strftime("%Y_%m_%dT%H.%M.%S.%f")
    # Ticket ID
    dir_name = f"{user_hash}-{timestamp}"
    dir_path = join(DATA_DIR, dir_name)

    if not isdir(dir_path):
        makedirs(dir_path)

    for file in files:
        content = await file.read()
        async with async_open(join(dir_path, file.filename), "wb") as write_file:
            await write_file.write(content)
    
    return dir_name

@route.get(
    path="/{ticket_id}",
    status_code=status.HTTP_200_OK
)
async def get_ticket_file_list(
    ticket_id: str=ticket_depends,
    download: bool=False
) -> list[str]:
    data_dir = join(DATA_DIR, ticket_id)
    if download:
        file_path = join("download-temp", f"{ticket_id}.zip")

        file_data: list[tuple[str, bytes]] = []
        for filename in listdir(data_dir):
            file_path = join(data_dir, filename)
            if not isfile(file_path): continue
            async with async_open(file_path, "rb") as file:
                content = await file.read()
            file_data.append((filename, content))
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
    else:
        return listdir(data_dir)

@route.get(
    path="/{ticket_id}/{filename}",
    status_code=status.HTTP_200_OK
)
async def get_ticket_context(
    filename: str,
    ticket_id: str=ticket_depends,
) -> FileResponse:
    dir_path = join(DATA_DIR, ticket_id)
    filepath = join(dir_path, filename)
    if not isfile(filepath):
        raise FILE_NOT_FOUND

    return FileResponse(
        path=filepath,
        media_type="text/plain",
        filename=filename
    )

@route.delete(
    path="/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_ticket(
    ticket_id: str=ticket_depends,
    user: User=user_depends
):
    user_hash = user.hash_value()

    if user.admin or ticket_id.startswith(f"{user_hash}-"):
        dir_path = join(DATA_DIR, ticket_id)
        rmtree(dir_path)
    else:
        raise PERMISSION_DENIED

