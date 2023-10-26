from fastapi import HTTPException, status

FILE_OVERSIZE = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="File size is over 32KB",
)

UNKNOW_ERROR = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Unknow Error",
)

UNAUTHORIZE = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Unauthorize"
)

AUTHORIZE_FAIL = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Authorize Fail"
)

PERMISSION_DENIED = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Permission denied.",
)
