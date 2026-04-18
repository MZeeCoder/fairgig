from fastapi import APIRouter

from app.modules.earnings.controller import EarningsController


earnings_router = APIRouter(prefix="/api/v1/earnings", tags=["earnings"])


earnings_router.post("/")(EarningsController.create_earning)
