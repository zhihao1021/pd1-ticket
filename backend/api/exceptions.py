from fastapi import HTTPException, status

FILE_OVERSIZE = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="File size is over 32KB",
)

DOWNLOAD_OVERSIZE = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="File size is over 32MB",
)

UNKNOW_ERROR = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Unknow Error",
)

UNKNOW_COMMAND = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Unknow Command",
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

FILE_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="File not found",
)
