from datetime import date
import logging
import csv
import io

from fastapi import Depends, File, Form, HTTPException, Query, Request, Response, UploadFile

from app.middlewares import upload_single_image_middleware
from app.modules.earnings.pdf_service import EarningsPdfService
from app.modules.earnings.schemas import WorkerDashboardResponse, WorkerEarningsResponse
from app.modules.earnings.service import EarningsService


class EarningsController:
    logger = logging.getLogger(__name__)

    @staticmethod
    async def create_earning(
        request: Request,
        platform: str = Form(...),
        city: str = Form(...),
        city_zone: str = Form(...),
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
            "city": city,
            "city_zone": city_zone,
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
    async def bulk_upload_earnings(
        request: Request,
        file: UploadFile = File(...),
    ):
        worker_id = getattr(request.state, "worker_id", None)
        if not worker_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        if not file.filename.endswith(".csv"):
            raise HTTPException(status_code=400, detail="Invalid file type. Must be a .csv file.")

        content = await file.read()
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="File could not be decoded. Ensure it is UTF-8 encoded.")

        reader = csv.DictReader(io.StringIO(text))
        
        required_fields = {
            "platform", "city", "city_zone", "date", "hours_worked", "gross_earned", 
            "deduction", "net_received", "screenshot_url"
        }
        
        # Verify columns exist
        if not reader.fieldnames:
            raise HTTPException(status_code=400, detail="CSV file is empty or missing headers.")
        
        missing_fields = required_fields - set(reader.fieldnames)
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"CSV is missing required columns: {', '.join(missing_fields)}"
            )

        payloads = []
        for row_index, row in enumerate(reader, start=1):
            try:
                payload = {
                    "worker_id": worker_id,
                    "platform": row["platform"].strip(),
                    "city": row["city"].strip(),
                    "city_zone": row["city_zone"].strip(),
                    "date": date.fromisoformat(row["date"].strip()),
                    "hours_worked": float(row["hours_worked"].strip()),
                    "gross_earned": float(row["gross_earned"].strip()),
                    "deduction": float(row["deduction"].strip()),
                    "net_received": float(row["net_received"].strip()),
                    "screenshot_url": row["screenshot_url"].strip(),
                    "status": row.get("status", "pending").strip(),
                }
                
                # Check for empty screenshot_url
                if not payload["screenshot_url"]:
                     raise ValueError("screenshot_url cannot be empty")

                payloads.append(payload)
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid data at row {row_index}: {str(e)}"
                )

        if not payloads:
             raise HTTPException(status_code=400, detail="No data rows found in the CSV.")

        # Create earnings in bulk
        await EarningsService.bulk_create_earnings(payloads)

        return {
            "message": f"Successfully uploaded {len(payloads)} earnings records",
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

    @staticmethod
    async def download_worker_dashboard_pdf(
        request: Request,
        platform: str | None = Query(default=None),
        start_date: date | None = Query(default=None),
        end_date: date | None = Query(default=None),
    ) -> Response:
        worker_id = getattr(request.state, "worker_id", None)
        if not worker_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        if start_date and end_date and start_date > end_date:
            raise HTTPException(status_code=400, detail="start_date cannot be after end_date")

        dashboard = await EarningsService.get_worker_dashboard(
            worker_id=worker_id,
            platform=platform,
            start_date=start_date,
            end_date=end_date,
        )

        try:
            pdf_bytes = await EarningsPdfService.generate_worker_dashboard_pdf(
                dashboard=dashboard,
                platform=platform,
                start_date=start_date.isoformat() if start_date else None,
                end_date=end_date.isoformat() if end_date else None,
            )
        except Exception as exc:
            EarningsController.logger.exception("Failed to generate worker dashboard PDF: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to generate PDF report") from exc

        filename = "worker-dashboard-report.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
