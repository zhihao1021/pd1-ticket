from asyncssh import PermissionDenied, SSHClientConnection
from fastapi import APIRouter, Form, status

from asyncio import get_event_loop
from os import listdir
from os.path import join
from subprocess import run, PIPE
from typing import Optional

from config import DATA_DIR
from schemas.user import User
from utils import get_ssh_session, check_ticket_authorized

from ..exceptions import (
    AUTHORIZE_FAIL,
    PERMISSION_DENIED,
    UNKNOW_ERROR
)
from ..depends import user_depends

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

@router.post(
    path="",
    status_code=status.HTTP_201_CREATED
)
async def upload_file(
    ticket_id: str=Form(),
    dir_path: str=Form(""),
    filename: Optional[str]=Form(None),
    formatCode: bool=Form(False),
    user: User=user_depends
):
    if ticket_id not in listdir(DATA_DIR):
        raise PERMISSION_DENIED
    if not check_ticket_authorized(
        ticket_id=ticket_id,
        user=user
    ): raise PERMISSION_DENIED
    
    client: Optional[SSHClientConnection] = None
    try:
        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )
        sftp = await client.start_sftp_client()
        dir_path = dir_path.removeprefix("~/")
        filename = filename or ticket_id.split('-', 2)[-1]
        path = join(dir_path, filename).replace("\\", "/")
        if (dir_path != "" and not await sftp.isdir(dir_path)):
            await sftp.makedirs(dir_path)

        if formatCode:
            def __format():
                try:
                    commands = [
                        "clang-format",
                        "--style=\"{ BasedOnStyle: Google, IndentWidth: 4, ColumnLimit: 0 }\"",
                        "\"" + join(DATA_DIR, ticket_id) + "\""
                    ]
                    result = run(
                        " ".join(commands),
                        stdout=PIPE
                    )
                    return result.stdout
                except:
                    return b""
            loop = get_event_loop()
            formatResult = await loop.run_in_executor(None, __format)
            if formatResult == b"":
                await sftp.put(join(DATA_DIR, ticket_id), path)
            else:
                async with sftp.open(path, "wb") as f:
                    await f.write(formatResult)
        else:
            await sftp.put(join(DATA_DIR, ticket_id), path)

        return path
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()
