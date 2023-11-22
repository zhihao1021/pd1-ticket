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
from ..depends import ticket_form_depends, user_depends

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

@router.post(
    path="",
    status_code=status.HTTP_201_CREATED
)
async def upload_file(
    ticket_id: str=ticket_form_depends,
    local_filename: str=Form(),
    remote_dir: str=Form(""),
    remote_filename: Optional[str]=Form(None),
    format_code: bool=Form(False),
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
        remote_dir = remote_dir.removeprefix("~/")
        remote_path = join(remote_dir, remote_filename or local_filename)
        remote_path = remote_path.replace("\\", "/")
        if (remote_dir != "" and not await sftp.isdir(remote_dir)):
            await sftp.makedirs(remote_dir)

        local_dir = join(DATA_DIR, ticket_id)
        local_path = join(local_dir, local_filename)
        
        if format_code:
            def __format():
                try:
                    commands = [
                        "clang-format",
                        "--style=\"{ BasedOnStyle: Google, IndentWidth: 4, ColumnLimit: 0 }\"",
                        "\"" + local_path + "\""
                    ]
                    result = run(
                        " ".join(commands),
                        stdout=PIPE
                    )
                    return result.stdout
                except:
                    return b""
            loop = get_event_loop()
            format_result = await loop.run_in_executor(None, __format)
            if format_result == b"":
                await sftp.put(local_path, remote_path)
            else:
                async with sftp.open(remote_path, "wb") as f:
                    await f.write(format_result)
        else:
            await sftp.put(local_path, remote_path)

        return remote_path
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()
