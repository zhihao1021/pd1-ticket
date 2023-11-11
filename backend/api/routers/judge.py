from asyncssh import SSHClientConnection, PermissionDenied
from fastapi import APIRouter, status

from config import DATA_DIR, JUDGE_COMMANDS
from os import listdir
from os.path import join
from schemas.user import User
from time import time
from typing import Optional
from utils import check_ticket_authorized, get_ssh_session

from ..depends import user_depends
from ..exceptions import (
    AUTHORIZE_FAIL,
    PERMISSION_DENIED,
    UNKNOW_COMMAND,
    UNKNOW_ERROR,
)

router = APIRouter(
    prefix="/judge",
    tags=["Judge"]
)

@router.get(
    path="",
    status_code=status.HTTP_200_OK
)
async def get_judge_list() -> list[str]:
    return JUDGE_COMMANDS

@router.get(
    path="/{ticket_id}",
    status_code=status.HTTP_200_OK
)
async def get_judge_result(
    ticket_id: str,
    command: str,
    user: User=user_depends
) -> str:
    if ticket_id not in listdir(DATA_DIR):
        raise PERMISSION_DENIED
    if command not in JUDGE_COMMANDS:
        raise UNKNOW_COMMAND
    
    pass_authorize = check_ticket_authorized(
        ticket_id=ticket_id,
        user=user
    )

    if not pass_authorize:
        raise PERMISSION_DENIED
    
    client: Optional[SSHClientConnection] = None
    try:
        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )
        sftp = await client.start_sftp_client()

        ticket_info = ticket_id.split("-", 2)[0][:4]
        timestamp  = int(time())
        dir_path = f"pd1-ticket-temp/{ticket_info}_{timestamp}"
        filename = f"{command}.c"
        path = f"{dir_path}/{filename}"

        if (not await sftp.isdir(dir_path)):
            await sftp.makedirs(dir_path)
        await sftp.put(join(DATA_DIR, ticket_id), path)

        if command == "hw6_random":
            command = "hw6"
        result = await client.run(
            f"{command} -p {dir_path}",
            timeout=15
        )
        result = result.stdout

        return result
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except TimeoutError:
        return "Judge Timeout."
    except:
        raise UNKNOW_ERROR
    finally:
        if client:
            client.close()
