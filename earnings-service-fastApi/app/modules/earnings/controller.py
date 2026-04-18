from datetime import date

from fastapi import Depends, Form, HTTPException, Request

from app.middlewares import upload_single_image_middleware
from app.modules.earnings.service import EarningsService


class EarningsController:
    @staticmethod
    async def create_earning(
        request: Request,
        worker_id: str = Form(...),
        platform: str = Form(...),
        date_value: date = Form(..., alias="date"),
        hours_worked: float = Form(...),
        gross_earned: float = Form(...),
        deduction: float = Form(...),
        net_received: float = Form(...),
        screenshot_url: str | None = Depends(upload_single_image_middleware),
    ):
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
