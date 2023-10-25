from aiofile import async_open
from fastapi import APIRouter, Cookie, HTTPException, Request, Response, status, UploadFile
from fastapi.responses import FileResponse

from os import listdir, remove
from os.path import isfile, join, splitext
from datetime import datetime, timedelta

from config import ADMIN_TOKEN, DATA_DIR
from utils.gen_token import gen_token
from utils.hash_token import hash_token

route = APIRouter(
    prefix="/ticket",
    tags=["Ticket"],
)

file_oversize = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="File size is over 32KB.",
)
permission_denied = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Permission denied.",
)

@route.get(
    path="",
    status_code=status.HTTP_200_OK,
)
async def get_all_ticket(
    request: Request,
    token: str = Cookie("")
):
    if len(token) != 32:
        return []
    token = hash_token(token, request.client.host or "localhost")
    if token == ADMIN_TOKEN:
        return listdir(DATA_DIR)
    result: list[str] = list(filter(
        lambda file_name: file_name.startswith(token),
        listdir(DATA_DIR))
    )

    return result

@route.post(
    path="",
    status_code=status.HTTP_201_CREATED,
)
async def add_ticket(
    request: Request,
    file: UploadFile,
    token: str = Cookie("")
):
    if file.size > 32 * 1024:
        raise file_oversize
    if len(token) != 32:
        token = gen_token()
    unhash_token = token
    token = hash_token(token, request.client.host or "localhost")
    
    timestamp = datetime.now().isoformat("T", "seconds")
    timestamp = timestamp.replace("-", "_").replace(":", ".")
    file_name = f"{token}-{timestamp}-{file.filename}"
    file_name = splitext(file_name)[0]
    new_file_name = file_name
    i = 1
    while isfile(join(DATA_DIR, new_file_name)):
        new_file_name = f"{file_name} ({i})"
        i += 1
    file_name = new_file_name
    content = await file.read()
    async with async_open(join(DATA_DIR, file_name), "wb") as write_file:
        await write_file.write(content)
    
    response = Response(file_name)
    response.set_cookie("token", unhash_token, max_age=31536000)
    return response

@route.get(
    path="/{ticket_id}",
    status_code=status.HTTP_200_OK
)
async def get_ticket(
    request: Request,
    ticket_id: str,
    token: str = Cookie("")
):
    if ticket_id not in listdir(DATA_DIR):
        raise permission_denied
    try:
        token = hash_token(token, request.client.host or "localhost")

        timestamp = ticket_id.split("-")[1]
        timestamp = timestamp.replace("_", "-").replace(".", ":")
        
        datetime_timestamp = datetime.fromisoformat(timestamp)
        delta_days = 3 - datetime_timestamp.weekday()
        delta_days += 0 if delta_days > 0 else 7
        expired = datetime.now() > (datetime_timestamp + timedelta(days=delta_days)).replace(hour=23, minute=59, second=59)
        if not expired and token != ADMIN_TOKEN and not (ticket_id.startswith(token) and len(token) == 32):
            raise permission_denied
        response = FileResponse(
            path=join(DATA_DIR, ticket_id),
            media_type="text/plain",
            filename=f"{ticket_id}.c"
        )
        return response
    except:
        raise permission_denied

@route.delete(
    path="/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_ticket(
    request: Request,
    ticket_id: str,
    token: str = Cookie(""),
):
    if len(token) != 32:
        raise permission_denied
    token = hash_token(token, request.client.host or "localhost")

    if ticket_id not in listdir(DATA_DIR):
        raise permission_denied
    remove(join(DATA_DIR, ticket_id))
    try:
        if token != ADMIN_TOKEN and not ticket_id.startswith(token):
            raise permission_denied
        
        return
    except:
        raise permission_denied
