from beanie import PydanticObjectId
from fastapi import HTTPException, Request

from app.modules.anomaly_detection.schemas import (
    AnomalyDetectRequest,
    AnomalyDetectResponse,
)
from app.modules.anomaly_detection.service import AnomalyDetectionService
from app.modules.earnings.model import Earnings, EarningsStatus


class AnomalyDetectionController:
    @staticmethod
    async def detect_anomaly(
        request: Request,
        payload: AnomalyDetectRequest,
    ) -> AnomalyDetectResponse:
        try:
            worker_id = getattr(request.state, "worker_id", None)
            if not worker_id:
                raise HTTPException(status_code=401, detail="Unauthorized")

            result = await AnomalyDetectionService.detect(
                new_earning_id=payload.new_earning_id,
                worker_id=worker_id,
            )

            if result.get("is_anomaly"):
                earning = await Earnings.find_one(
                    Earnings.id == PydanticObjectId(payload.new_earning_id),
                    Earnings.worker_id == PydanticObjectId(worker_id),
                )
                if earning:
                    earning.anomaly_explanation = result.get("explanation")
                    earning.status = EarningsStatus.FLAGGED
                    await earning.save()

            return AnomalyDetectResponse(**result)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
