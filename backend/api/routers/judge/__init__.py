from aiofile import async_open
from asyncssh import PermissionDenied
from fastapi import APIRouter, status
from orjson import loads
from pydantic import BaseModel

from os import listdir

from schemas.user import User
from utils import JudgeConnection, similar_file

from ...depends import ticket_depends, user_depends
from ...exceptions import (
    AUTHORIZE_FAIL,
    UNKNOW_COMMAND,
    UNKNOW_ERROR,
)

from .schema import JudgeResult

from .common import commom_judge

JUDGE_LIST = list(map(
    lambda filename: filename.removesuffix(".json"),
    filter(lambda filename: filename.endswith(".json"), listdir("judge_config"))
))

router = APIRouter(
    prefix="/judge",
    tags=["Judge"]
)

@router.get(
    path="",
    status_code=status.HTTP_200_OK
)
async def get_judge_list() -> list[str]:
    return JUDGE_LIST

@router.get(
    path="/{ticket_id}",
    status_code=status.HTTP_200_OK
)
async def get_judge_result(
    command: str,
    user: User=user_depends,
    ticket_id: str=ticket_depends,
) -> JudgeResult:
    if command not in JUDGE_LIST:
        raise UNKNOW_COMMAND
    
    async with async_open(f"judge_config/{command}.json", "rb") as config_file:
        config = loads(await config_file.read())
    return await commom_judge(
        user=user,
        ticket_id=ticket_id,
        **config,
    )
