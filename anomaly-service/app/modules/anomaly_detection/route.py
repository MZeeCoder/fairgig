from typing import List
from fastapi import APIRouter, Depends, Request

from app.middlewares import authenticate_access_token
from app.modules.anomaly_detection.controller import AnomalyDetectionController
from app.modules.anomaly_detection.schemas import (
    AnomalyDetectRequest,
    AnomalyDetectBulkRequest,
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

@anomaly_router.post(
    "/detect/bulk",
    response_model=List[AnomalyDetectResponse],
    summary="Detect anomalies for bulk uploaded earnings",
)
async def detect_bulk_anomaly(
    request: Request,
    payload: AnomalyDetectBulkRequest,
    _: dict = Depends(authenticate_access_token),
) -> List[AnomalyDetectResponse]:
    return await AnomalyDetectionController.detect_bulk_anomaly(request, payload)
