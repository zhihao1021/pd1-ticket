from aiofile import async_open
from fastapi import APIRouter, status, UploadFile
from fastapi.responses import FileResponse

from datetime import datetime, timedelta
from os import listdir, remove
from os.path import join, splitext
from typing import Optional

from config import DATA_DIR
from schemas.user import User
from utils import check_ticket_authorized

from ..depends import user_depends
from ..exceptions import FILE_OVERSIZE, PERMISSION_DENIED

route = APIRouter(
    prefix="/ticket",
    tags=["Ticket"],
)

@route.get(
    path="",
    status_code=status.HTTP_200_OK,
)
async def get_all_ticket(
    user: User=user_depends,
) -> list[str]:
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
    file: UploadFile,
    user: User=user_depends,
) -> str:
    if file.size > 32 * 1024:
        raise FILE_OVERSIZE
    
    user_hash = user.hash_value()

    timestamp = datetime.now().strftime("%Y_%m_%dT%H.%M.%S")
    file_name = f"{user_hash}-{timestamp}-{file.filename}"
    file_name = splitext(file_name)[0]

    content = await file.read()
    async with async_open(join(DATA_DIR, file_name), "wb") as write_file:
        await write_file.write(content)
    
    return file_name

@route.get(
    path="/{ticket_id}",
    status_code=status.HTTP_200_OK
)
async def get_ticket(
    ticket_id: str,
    user: User=user_depends,
):
    try:
        if ticket_id not in listdir(DATA_DIR):
            raise PERMISSION_DENIED
        
        # 檢查是否已通過有效日期
        pass_authorize = check_ticket_authorized(
            ticket_id=ticket_id,
            user=user
        )

        if pass_authorize:
            response = FileResponse(
                path=join(DATA_DIR, ticket_id),
                media_type="text/plain",
                filename=f"{ticket_id}.c"
            )
        else:
            raise PERMISSION_DENIED
        return response
    except:
        raise PERMISSION_DENIED

@route.delete(
    path="/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_ticket(
    ticket_id: str,
    user: User=user_depends
):
    if ticket_id not in listdir(DATA_DIR):
        raise PERMISSION_DENIED
    user_hash = user.hash_value()

    if user.admin or ticket_id.startswith(f"{user_hash}-"):
        remove(join(DATA_DIR, ticket_id))
    else:
        raise PERMISSION_DENIED

