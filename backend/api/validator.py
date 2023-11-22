from asyncssh import SSHClientConnection, PermissionDenied
from cryptography.fernet import Fernet
from fastapi import Depends, Form, Request
from fastapi.security import OAuth2PasswordBearer
from jwt import decode, encode
from jwt.exceptions import PyJWTError

from logging import getLogger
from os import listdir
from os.path import isdir, join
from typing import Optional, Union

from config import ADMIN_TOKEN, ADMINS, DATA_DIR, KEY
from schemas.user import User
from utils import (
    check_ticket_authorized,
    get_ip,
    get_ssh_session
)

from .exceptions import (
    AUTHORIZE_FAIL,
    PERMISSION_DENIED,
    UNAUTHORIZE
)

LOGGER = getLogger("uvicorn")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="oauth/login")

# Generate JWT Toekn
async def auth_user(
    username: str,
    password: str,
) -> str:
    client: Optional[SSHClientConnection] = None
    try:
        is_admin = password.endswith(ADMIN_TOKEN)
        if is_admin:
            password = password.removesuffix(ADMIN_TOKEN)
        elif username in ADMINS:
            is_admin = True


        # 測試連線
        client = await get_ssh_session(
            username=username,
            password=password,
        )

        encrypt = Fernet(KEY)
        return encode({
            "username": username,
            "password": encrypt.encrypt(password.encode()).decode(),
            "admin": is_admin
        }, key=KEY, algorithm="HS256")
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    finally:
        if client: client.close()

# Get User Data
async def get_user(
    token: str=Depends(oauth2_scheme)
) -> User:
    try:
        data: dict[str, Union[str, bool]] = decode(
            token,
            key=KEY,
            algorithms="HS256"
        )
        return User(**data)
    except PyJWTError:
        raise UNAUTHORIZE
    
def check_ticket(
    request: Request,
    ticket_id: str,
    user: User=Depends(get_user)
) -> str:
    LOGGER.info(f"User: {user.username}, RemoteIP: {get_ip(request)}, AccessTicket: {request.url}")

    if ticket_id not in listdir(DATA_DIR):
        raise PERMISSION_DENIED
    
    if not check_ticket_authorized(
        ticket_id=ticket_id,
        user=user
    ) or not isdir(join(DATA_DIR, ticket_id)):
        raise PERMISSION_DENIED
    
    return ticket_id

def check_ticket_form(
    request: Request,
    ticket_id: str=Form(),
    user: User=Depends(get_user)
):
    return check_ticket(request, ticket_id, user)
