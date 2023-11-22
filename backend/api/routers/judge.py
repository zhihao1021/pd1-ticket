from asyncssh import SSHClientConnection, PermissionDenied
from fastapi import APIRouter, status

from config import DATA_DIR, JUDGE_COMMANDS
from os import listdir
from os.path import join
from schemas.user import User
from time import time
from typing import Optional
from utils import check_ticket_authorized, get_ssh_session

from ..depends import ticket_depends, user_depends
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
    command: str,
    user: User=user_depends,
    ticket_id: str=ticket_depends,
) -> str:
    if command not in JUDGE_COMMANDS:
        raise UNKNOW_COMMAND
    
    client: Optional[SSHClientConnection] = None
    try:
        client = await get_ssh_session(
            username=user.username,
            password=user.decrypted_password()
        )
        sftp = await client.start_sftp_client()

        ticket_info = ticket_id.split("-", 2)[0][:4]
        timestamp  = int(time())
        remote_dir_path = f"pd1-ticket-temp/{ticket_info}_{timestamp}"
        if not await sftp.isdir(remote_dir_path):
            await sftp.makedirs(remote_dir_path)
        
        local_dir_path = join(DATA_DIR, ticket_id)

        async def __upload(local_file: str, remote_file: str):
            local_path = join(local_dir_path, local_file)
            remote_path = f"{remote_dir_path}/{remote_file}"
            await sftp.put(local_path, remote_path)

        local_file = f"{command}.c"
        if local_file not in listdir(local_dir_path):
            local_file = listdir(local_dir_path)[0]
            local_file_list = list(filter(lambda file: file.endswith(".c"), listdir(local_dir_path)))
            if len(local_file_list) != 0:
                local_file = local_file_list[0]
        remote_file = f"{command}.c"
        await __upload(local_file=local_file, remote_file=remote_file)

        # 追加條件-檔案
        if command == "hw8":
            local_file = f"{command}.h"
            if local_file not in listdir(local_dir_path):
                local_file = listdir(local_dir_path)[1]
                local_file_list = list(filter(lambda file: file.endswith(".h"), listdir(local_dir_path)))
                if len(local_file_list) != 0:
                    local_file = local_file_list[0]
            await __upload(local_file=local_file, remote_file="hw8.h")

        # 追加條件-指令
        if command == "hw6_random":
            command = "hw6"

        result = await client.run(
            f"{command} -p {remote_dir_path}",
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
