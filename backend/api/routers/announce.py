from aiofile import async_open
from fastapi import APIRouter, Form, status
from orjson import loads, dumps

from schemas.announcement import Announcement
from schemas.user import User

from ..depends import user_depends
from ..exceptions import PERMISSION_DENIED

router = APIRouter(
    prefix="/announce",
    tags=["Announce"]
)

@router.get(
    path="",
    status_code=status.HTTP_200_OK,
    response_model=Announcement
)
async def get_announcement() -> Announcement:
    async with async_open("announcement.json", "rb") as announce_file:
        content = await announce_file.read()
    data: Announcement = Announcement.model_validate(loads(content))
    return data

@router.put(
    path="",
    status_code=status.HTTP_200_OK,
    response_model=Announcement
)
async def update_announcement(
    user: User=user_depends,
    data: list[str]=Form()
) -> Announcement:
    if not user.admin:
        raise PERMISSION_DENIED
    
    async with async_open("announcement.json", "rb") as announce_file:
        content = await announce_file.read()
    raw_data = loads(content)
    new_data: Announcement = Announcement(
        readonly=raw_data["readonly"],
        data=data
    )

    dump_data = dumps(new_data.model_dump())
    async with async_open("announcement.json", "wb") as announce_file:
        await announce_file.write(dump_data)
    return new_data
