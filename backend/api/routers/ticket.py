from aiofile import async_open
from fastapi import APIRouter, Request, status, UploadFile
from fastapi.responses import FileResponse

from datetime import datetime
from logging import getLogger
from os import listdir, remove
from os.path import join

from config import DATA_DIR
from schemas.user import User
from utils import check_ticket_authorized, get_ip

from ..depends import user_depends
from ..validator import get_user
from ..exceptions import FILE_OVERSIZE, PERMISSION_DENIED

LOGGER = getLogger("uvicorn")

async def __get_ticket(user: User, ticket_id: str):
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
                filename=ticket_id
            )
        else:
            raise PERMISSION_DENIED
        return response
    except:
        raise PERMISSION_DENIED

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
    file: UploadFile,
    user: User=user_depends,
) -> str:
    if file.size > 32 * 1024:
        raise FILE_OVERSIZE
    
    user_hash = user.hash_value()

    timestamp = datetime.now().strftime("%Y_%m_%dT%H.%M.%S")
    file_name = f"{user_hash}-{timestamp}-{file.filename}"
    file_name = file_name

    content = await file.read()
    async with async_open(join(DATA_DIR, file_name), "wb") as write_file:
        await write_file.write(content)
    
    return file_name

@route.get(
    path="/{ticket_id}",
    status_code=status.HTTP_200_OK
)
async def get_ticket(
    request: Request,
    ticket_id: str,
    user: User = user_depends
):
    LOGGER.info(f"User: {user.username}, RemoteIP: {get_ip(request)}, AccessTicket: {ticket_id}")
    return await __get_ticket(user, ticket_id)

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

