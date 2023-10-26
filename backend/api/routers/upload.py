from asyncssh import PermissionDenied, SSHClientConnection
from fastapi import APIRouter, Form, status

from os import listdir
from os.path import join, split
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
        filename = filename or f"{ticket_id.rsplit('-', 1)[-1]}.c"
        path = join(dir_path, filename).replace("\\", "/")
        if (dir_path != "" and not await sftp.isdir(dir_path)):
            await sftp.makedirs(dir_path)
        await sftp.put(join(DATA_DIR, ticket_id), path)
        return path
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()
