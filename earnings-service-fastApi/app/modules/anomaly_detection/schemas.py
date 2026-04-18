from typing import Literal

from pydantic import BaseModel, Field


class AnomalyDetectRequest(BaseModel):
    new_earning_id: str = Field(
        min_length=1,
        description="Mongo ObjectId of the newly created earning to evaluate",
        examples=["67f6a6c0123456789abcdef0"],
    )


class AnomalyDetectResponse(BaseModel):
    """Structured anomaly decision payload for downstream legal/judicial review."""

    is_anomaly: bool
    anomaly_type: Literal["high_deduction", "income_drop", "none"]
    explanation: str
