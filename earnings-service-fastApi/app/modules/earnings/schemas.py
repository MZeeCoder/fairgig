from pydantic import BaseModel


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


class WorkerDashboardResponse(BaseModel):
    active_filter: ActiveFilter
    summary: SummaryMetrics
    earning_trend: list[EarningTrendItem]
    platform_breakdown: list[PlatformBreakdownItem]
    benchmarks: BenchmarkMetrics