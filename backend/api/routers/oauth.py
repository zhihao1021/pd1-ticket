from fastapi import APIRouter, Cookie, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from ..validator import auth_user

class Token(BaseModel):
    access_token: str
    token_type: str="bearer"

router = APIRouter(
    prefix="/oauth",
    tags=["OAuth"]
)

@router.post(
    path="/login",
    response_model=Token
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Token:
    jwt_token = await auth_user(
        username=form_data.username,
        password=form_data.password,
    )

    return Token(
        access_token=jwt_token
    )
