from datetime import date

from pydantic import BaseModel

from app.modules.earnings.model import EarningsStatus


class ActiveFilter(BaseModel):
    platform: str | None
    time_frame: str


class SummaryMetrics(BaseModel):
    total_verified_net: float
    current_hourly_rate: float


class EarningTrendItem(BaseModel):
    period: str
    net: float
    effective_hourly_rate: float


class PlatformBreakdownItem(BaseModel):
    platform: str
    avg_commission_rate: float
    total_earned: float


class BenchmarkMetrics(BaseModel):
    city: str
    city_median: float
    status: str


class WorkerEarningItem(BaseModel):
    id: str
    worker_id: str
    platform: str
    date: date
    hours_worked: float
    gross_earned: float
    deduction: float
    net_received: float
    screenshot_url: str
    status: EarningsStatus


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_more: bool


class WorkerEarningsResponse(BaseModel):
    items: list[WorkerEarningItem]
    pagination: PaginationMeta


class WorkerDashboardResponse(BaseModel):
    active_filter: ActiveFilter
    summary: SummaryMetrics
    earning_trend: list[EarningTrendItem]
    platform_breakdown: list[PlatformBreakdownItem]
    benchmarks: BenchmarkMetrics