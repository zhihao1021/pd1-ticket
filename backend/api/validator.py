from asyncssh import connect, SSHClientConnection, SSHClientConnectionOptions, PermissionDenied
from cryptography.fernet import Fernet
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import decode, encode
from jwt.exceptions import PyJWTError

from typing import Optional, Union

from config import ADMIN_TOKEN, KEY, SSH_ADDRESS
from schemas.user import User

from .exceptions import AUTHORIZE_FAIL, UNAUTHORIZE

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="oauth/login")

# Generate JWT Toekn
async def auth_user(
    username: str,
    password: str,
) -> str:
    client: Optional[SSHClientConnection] = None
    try:
        is_admin = password.endswith(ADMIN_TOKEN)
        if is_admin: password = password.removesuffix(ADMIN_TOKEN)
        host, port = SSH_ADDRESS.split(":")
        # 測試連線
        client = await connect(
            host=host,
            port=int(port),
            username=username,
            password=password,
            options=SSHClientConnectionOptions(
                public_key_auth=False
            )
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
