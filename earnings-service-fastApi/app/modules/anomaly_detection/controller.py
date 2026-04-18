from fastapi import HTTPException, Request

from app.modules.anomaly_detection.schemas import (
    AnomalyDetectRequest,
    AnomalyDetectResponse,
)
from app.modules.anomaly_detection.service import AnomalyDetectionService


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
            return AnomalyDetectResponse(**result)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
