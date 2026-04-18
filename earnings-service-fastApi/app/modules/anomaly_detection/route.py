from fastapi import APIRouter, Depends, Request

from app.middlewares import authenticate_access_token
from app.modules.anomaly_detection.controller import AnomalyDetectionController
from app.modules.anomaly_detection.schemas import (
    AnomalyDetectRequest,
    AnomalyDetectResponse,
)


anomaly_router = APIRouter(prefix="/anomaly", tags=["anomaly_detection"])


@anomaly_router.post(
    "/detect",
    response_model=AnomalyDetectResponse,
    summary="Detect anomalies for a new earning",
)
async def detect_anomaly(
    request: Request,
    payload: AnomalyDetectRequest,
    _: dict = Depends(authenticate_access_token),
) -> AnomalyDetectResponse:
    return await AnomalyDetectionController.detect_anomaly(request, payload)
