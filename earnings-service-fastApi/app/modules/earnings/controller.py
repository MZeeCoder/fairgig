from datetime import date

from fastapi import Depends, Form, HTTPException, Query, Request

from app.middlewares import upload_single_image_middleware
from app.modules.earnings.schemas import WorkerDashboardResponse, WorkerEarningsResponse
from app.modules.earnings.service import EarningsService


class EarningsController:
    @staticmethod
    async def create_earning(
        request: Request,
        platform: str = Form(...),
        date_value: date = Form(..., alias="date"),
        hours_worked: float = Form(...),
        gross_earned: float = Form(...),
        deduction: float = Form(...),
        net_received: float = Form(...),
        screenshot_url: str | None = Depends(upload_single_image_middleware),
    ):
        worker_id = getattr(request.state, "worker_id", None)
        if not worker_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        if not screenshot_url:
            raise HTTPException(status_code=400, detail="Screenshot image is required")

        payload = {
            "worker_id": worker_id,
            "platform": platform,
            "date": date_value,
            "hours_worked": hours_worked,
            "gross_earned": gross_earned,
            "deduction": deduction,
            "net_received": net_received,
            "screenshot_url": screenshot_url,
        }

        earning = await EarningsService.create_earning(payload)
        return {
            "message": "Earning created successfully",
            "data": earning.model_dump(by_alias=True),
        }

    @staticmethod
    async def get_platforms(request: Request):
        worker_id = getattr(request.state, "worker_id", None)
        if not worker_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        platforms = await EarningsService.get_worker_platforms(worker_id)
        return {
            "message": "Platforms fetched successfully",
            "data": platforms,
        }

    @staticmethod
    async def get_worker_earnings(
        request: Request,
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
    ) -> WorkerEarningsResponse:
        worker_id = getattr(request.state, "worker_id", None)
        if not worker_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        return await EarningsService.get_worker_earnings(
            worker_id=worker_id,
            page=page,
            limit=limit,
        )

    @staticmethod
    async def get_worker_dashboard(
        request: Request,
        platform: str | None = Query(default=None),
        start_date: date | None = Query(default=None),
        end_date: date | None = Query(default=None),
    ) -> WorkerDashboardResponse:
        worker_id = getattr(request.state, "worker_id", None)
        if not worker_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        if start_date and end_date and start_date > end_date:
            raise HTTPException(status_code=400, detail="start_date cannot be after end_date")

        return await EarningsService.get_worker_dashboard(
            worker_id=worker_id,
            platform=platform,
            start_date=start_date,
            end_date=end_date,
        )
