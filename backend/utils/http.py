from fastapi import Request

from datetime import datetime, timedelta

from config import EXPIRED_WEEKDAY, EXPIRED_WEEK, SSH_ADDRESS
from schemas.user import User

def check_ticket_authorized(
    ticket_id: str,
    user: User,
) -> bool:
    try:
        timestamp = ticket_id.split("-")[1]
        datetime_timestamp = datetime.strptime(timestamp, "%Y_%m_%dT%H.%M.%S.%f")
        
        # 檢查是否已通過有效日期
        if EXPIRED_WEEK > 0:
            delta_days = min(6, max(0, EXPIRED_WEEKDAY)) - datetime_timestamp.weekday()
            delta_days += 0 if delta_days > 0 else 7
            expired = datetime.now() > (datetime_timestamp + timedelta(days=delta_days + 7 * (EXPIRED_WEEK - 1))).replace(hour=23, minute=59, second=59)
        else:
            expired = True

        pass_authorize = expired
        if user is not None:
            user_hash = user.hash_value()
            pass_authorize = pass_authorize or user.admin
            pass_authorize = pass_authorize or ticket_id.startswith(f"{user_hash}-")
        
        return pass_authorize
    except: return False

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
