from asyncssh import PermissionDenied
from fastapi import APIRouter, status
from pydantic import BaseModel

from config import JUDGE_COMMANDS
from schemas.user import User
from utils import JudgeConnection, similar_file

from ..depends import ticket_depends, user_depends
from ..exceptions import (
    AUTHORIZE_FAIL,
    UNKNOW_COMMAND,
    UNKNOW_ERROR,
)

class JudgeList(BaseModel):
    normal: list[str]
    special: list[str]

router = APIRouter(
    prefix="/judge",
    tags=["Judge"]
)

@router.get(
    path="",
    status_code=status.HTTP_200_OK
)
async def get_judge_list() -> JudgeList:
    return JudgeList(normal=JUDGE_COMMANDS, special=["judge8-1", "judge8-2"])

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
    
    judge: JudgeConnection = JudgeConnection(
        user=user,
        ticket_id=ticket_id
    )
    try:
        await judge.open()

        local_file = similar_file(f"{command}.c", judge.local_dir_path)
        await judge.upload(
            local_file=local_file,
            remote_file=f"{command}.c"
        )

        # 追加條件-檔案
        if command.startswith("hw8"):
            local_file = similar_file(f"{command}.h", judge.local_dir_path)
            await judge.upload(
                local_file=local_file,
                remote_file=f"{command}.h"
            )

        # 追加條件-指令
        if command == "hw6_random":
            command = "hw6"

        result, _, _ = await judge.command(
            command=f"{command} -p {judge.remote_dir_path}",
            timeout=15,
            chdir=False
        )

        return result
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except TimeoutError:
        return "Judge Timeout."
    except:
        raise UNKNOW_ERROR
    finally:
        judge.close()
