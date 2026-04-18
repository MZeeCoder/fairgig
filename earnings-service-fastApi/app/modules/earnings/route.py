from fastapi import APIRouter, Depends

from app.middlewares import authenticate_access_token
from app.modules.earnings.controller import EarningsController


earnings_router = APIRouter(prefix="/api/v1/earnings", tags=["earnings"])


earnings_router.post("/", dependencies=[Depends(authenticate_access_token)])(
    EarningsController.create_earning
)
