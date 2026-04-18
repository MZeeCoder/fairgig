from fastapi import APIRouter, Depends

from app.middlewares import authenticate_access_token
from app.modules.earnings.controller import EarningsController
from app.modules.earnings.schemas import WorkerDashboardResponse, WorkerEarningsResponse


earnings_router = APIRouter(prefix="/api/v1/earnings", tags=["earnings"])


earnings_router.post("/", dependencies=[Depends(authenticate_access_token)])(
    EarningsController.create_earning
)

earnings_router.get("/analytics/platforms", dependencies=[Depends(authenticate_access_token)])(
    EarningsController.get_platforms
)

earnings_router.get(
    "/history",
    response_model=WorkerEarningsResponse,
    dependencies=[Depends(authenticate_access_token)],
)(EarningsController.get_worker_earnings)

earnings_router.get(
    "/analytics/worker-dashboard",
    response_model=WorkerDashboardResponse,
    dependencies=[Depends(authenticate_access_token)],
)(EarningsController.get_worker_dashboard)
