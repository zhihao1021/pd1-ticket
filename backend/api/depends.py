from fastapi import Depends

from .validator import (
    get_user,
    check_ticket,
    check_ticket_form,
)

ticket_depends = Depends(check_ticket)
ticket_form_depends = Depends(check_ticket_form)
user_depends = Depends(get_user)
