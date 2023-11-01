from asyncssh import connect, SSHClientConnection, SSHClientConnectionOptions
from fastapi import Request

from datetime import datetime, timedelta

from config import SSH_ADDRESS
from schemas.user import User

async def get_ssh_session(
    username: str,
    password: str,
) -> SSHClientConnection:
    host, port = SSH_ADDRESS.split(":")
    client = await connect(
        host=host,
        port=int(port),
        username=username,
        password=password,
        options=SSHClientConnectionOptions(
            public_key_auth=False
        )
    )
    return client

def check_ticket_authorized(
    ticket_id: str,
    user: User,
) -> bool:
    timestamp = ticket_id.split("-")[1]
    datetime_timestamp = datetime.strptime(timestamp, "%Y_%m_%dT%H.%M.%S")
    
    # 檢查是否已通過有效日期
    delta_days = 3 - datetime_timestamp.weekday()
    delta_days += 0 if delta_days > 0 else 7
    expired = datetime.now() > (datetime_timestamp + timedelta(days=delta_days)).replace(hour=23, minute=59, second=59)

    pass_authorize = expired
    if user is not None:
        user_hash = user.hash_value()
        pass_authorize = pass_authorize or user.admin
        pass_authorize = pass_authorize or ticket_id.startswith(f"{user_hash}-")
    
    return pass_authorize

def get_ip(request: Request):
    header = request.headers
    try:
        forward_list = header.get("x-forwarded-for")
        result = forward_list.split(",")[0].strip()
        if result.count(".") != 3:
            return request.client.host
        return result
    except:
        return request.client.host
