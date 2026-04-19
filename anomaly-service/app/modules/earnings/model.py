from datetime import date
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field


class EarningsStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    UNVERIFIABLE = "unverifiable"
    FLAGGED = "flagged"


class Earnings(Document):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    worker_id: PydanticObjectId = Field(description="Reference to User collection _id")
    platform: str = Field(min_length=1)
    city: str | None = Field(default=None)
    city_zone: str | None = Field(default=None)
    date: date
    hours_worked: float = Field(ge=0)
    gross_earned: float = Field(ge=0)
    deduction: float = Field(ge=0)
    net_received: float = Field(ge=0)
    screenshot_url: str = Field(min_length=1)
    anomaly_explanation: str | None = Field(default=None)
    status: EarningsStatus = EarningsStatus.PENDING

    class Settings:
        name = "earnings"
