from fastapi import APIRouter

from .judge8_1 import router as judge8_1_router
from .judge8_2 import router as judge8_2_router

router = APIRouter(
    prefix="/special_judge",
    tags=["Special Judge"]
)

router.include_router(judge8_1_router)
router.include_router(judge8_2_router)
