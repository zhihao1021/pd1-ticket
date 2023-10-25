from fastapi import Depends

from .validator import get_user

user_depends = Depends(get_user)
