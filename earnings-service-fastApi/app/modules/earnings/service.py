from datetime import date
from math import ceil

from beanie import PydanticObjectId

from app.modules.earnings.model import Earnings
from app.modules.earnings.schemas import (
    ActiveFilter,
    BenchmarkMetrics,
    EarningTrendItem,
    PlatformBreakdownItem,
    PaginationMeta,
    SummaryMetrics,
    WorkerEarningItem,
    WorkerEarningsResponse,
    WorkerDashboardResponse,
)


class EarningsService:
    @staticmethod
    async def create_earning(payload: dict) -> Earnings:
        earning = Earnings(
            worker_id=PydanticObjectId(payload["worker_id"]),
            platform=payload["platform"],
            date=payload["date"],
            hours_worked=payload["hours_worked"],
            gross_earned=payload["gross_earned"],
            deduction=payload["deduction"],
            net_received=payload["net_received"],
            screenshot_url=payload["screenshot_url"],
        )
        await earning.insert()
        return earning

    @staticmethod
    async def get_worker_platforms(worker_id: str) -> list[str]:
        platforms = await Earnings.get_motor_collection().distinct(
            "platform",
            {"worker_id": PydanticObjectId(worker_id)},
        )
        return sorted(platforms)

    @staticmethod
    def _serialize_earning_document(document: dict) -> WorkerEarningItem:
        return WorkerEarningItem(
            id=str(document.get("_id", "")),
            worker_id=str(document.get("worker_id", "")),
            platform=str(document.get("platform", "")),
            date=document.get("date"),
            hours_worked=float(document.get("hours_worked", 0.0) or 0.0),
            gross_earned=float(document.get("gross_earned", 0.0) or 0.0),
            deduction=float(document.get("deduction", 0.0) or 0.0),
            net_received=float(document.get("net_received", 0.0) or 0.0),
            screenshot_url=str(document.get("screenshot_url", "")),
            status=document.get("status", "pending"),
        )

    @staticmethod
    async def get_worker_earnings(
        worker_id: str,
        page: int = 1,
        limit: int = 10,
    ) -> WorkerEarningsResponse:
        worker_object_id = PydanticObjectId(worker_id)
        collection = Earnings.get_motor_collection()

        query_filter = {"worker_id": worker_object_id}
        total = await collection.count_documents(query_filter)

        skip = (page - 1) * limit
        cursor = (
            collection.find(query_filter)
            .sort([("date", -1), ("_id", -1)])
            .skip(skip)
            .limit(limit)
        )
        documents = await cursor.to_list(length=limit)

        items = [EarningsService._serialize_earning_document(document) for document in documents]
        total_pages = ceil(total / limit) if total else 0

        return WorkerEarningsResponse(
            items=items,
            pagination=PaginationMeta(
                page=page,
                limit=limit,
                total=total,
                total_pages=total_pages,
                has_more=page < total_pages,
            ),
        )

    @staticmethod
    async def _resolve_worker_city_zone(worker_object_id: PydanticObjectId) -> str | None:
        collection = Earnings.get_motor_collection()
        doc = await collection.find_one(
            {"worker_id": worker_object_id, "city_zone": {"$exists": True, "$ne": None}},
            {"city_zone": 1},
        )
        return doc.get("city_zone") if doc else None

    @staticmethod
    async def _calculate_city_median_net(
        worker_object_id: PydanticObjectId,
        city_zone: str | None,
        platform: str | None,
        start_date: date | None,
        end_date: date | None,
    ) -> float:
        if not city_zone:
            return 0.0

        match_filter: dict = {
            "worker_id": {"$ne": worker_object_id},
            "city_zone": city_zone,
        }

        if platform:
            match_filter["platform"] = platform

        if start_date or end_date:
            date_filter: dict = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            match_filter["date"] = date_filter

        pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": "$worker_id",
                    "worker_avg_net": {"$avg": "$net_received"},
                }
            },
            {"$project": {"_id": 0, "worker_avg_net": 1}},
        ]

        docs = await Earnings.get_motor_collection().aggregate(pipeline).to_list(length=None)
        values = sorted(
            float(item.get("worker_avg_net", 0.0))
            for item in docs
            if item.get("worker_avg_net") is not None
        )

        if not values:
            return 0.0

        mid = len(values) // 2
        if len(values) % 2 == 0:
            return (values[mid - 1] + values[mid]) / 2
        return values[mid]

    @staticmethod
    async def get_worker_dashboard(
        worker_id: str,
        platform: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> WorkerDashboardResponse:
        worker_object_id = PydanticObjectId(worker_id)
        collection = Earnings.get_motor_collection()

        match_filter: dict = {"worker_id": worker_object_id}
        if platform:
            match_filter["platform"] = platform

        if start_date or end_date:
            date_filter: dict = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            match_filter["date"] = date_filter

        summary_pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": None,
                    "total_net": {"$sum": "$net_received"},
                    "total_hours": {"$sum": "$hours_worked"},
                    "total_gross": {"$sum": "$gross_earned"},
                    "total_deductions": {"$sum": "$deduction"},
                    "total_verified_net": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "verified"]},
                                "$net_received",
                                0,
                            ]
                        }
                    },
                    "user_avg_net": {"$avg": "$net_received"},
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "total_verified_net": 1,
                    "current_hourly_rate": {
                        "$cond": [
                            {"$gt": ["$total_hours", 0]},
                            {"$divide": ["$total_net", "$total_hours"]},
                            0,
                        ]
                    },
                    "platform_commission_rate": {
                        "$cond": [
                            {"$gt": ["$total_gross", 0]},
                            {
                                "$multiply": [
                                    {
                                        "$divide": [
                                            "$total_deductions",
                                            "$total_gross",
                                        ]
                                    },
                                    100,
                                ]
                            },
                            0,
                        ]
                    },
                    "user_avg_net": 1,
                }
            },
        ]

        trend_pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m",
                            "date": "$date",
                        }
                    },
                    "total_net": {"$sum": "$net_received"},
                    "total_hours": {"$sum": "$hours_worked"},
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "period": "$_id",
                    "net": "$total_net",
                    "effective_hourly_rate": {
                        "$cond": [
                            {"$gt": ["$total_hours", 0]},
                            {"$divide": ["$total_net", "$total_hours"]},
                            0,
                        ]
                    },
                }
            },
        ]

        platform_breakdown_pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": "$platform",
                    "total_gross": {"$sum": "$gross_earned"},
                    "total_deductions": {"$sum": "$deduction"},
                    "total_earned": {"$sum": "$net_received"},
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "platform": "$_id",
                    "total_earned": 1,
                    "avg_commission_rate": {
                        "$cond": [
                            {"$gt": ["$total_gross", 0]},
                            {
                                "$multiply": [
                                    {
                                        "$divide": [
                                            "$total_deductions",
                                            "$total_gross",
                                        ]
                                    },
                                    100,
                                ]
                            },
                            0,
                        ]
                    },
                }
            },
            {"$sort": {"total_earned": -1}},
        ]

        summary_docs = await collection.aggregate(summary_pipeline).to_list(length=1)
        trend_docs = await collection.aggregate(trend_pipeline).to_list(length=None)
        platform_docs = await collection.aggregate(platform_breakdown_pipeline).to_list(length=None)

        summary_doc = summary_docs[0] if summary_docs else {}
        city_zone = await EarningsService._resolve_worker_city_zone(worker_object_id)
        city_median = await EarningsService._calculate_city_median_net(
            worker_object_id=worker_object_id,
            city_zone=city_zone,
            platform=platform,
            start_date=start_date,
            end_date=end_date,
        )

        user_avg_net = float(summary_doc.get("user_avg_net", 0.0) or 0.0)
        if city_median == 0:
            benchmark_status = "No benchmark data"
        elif user_avg_net >= city_median:
            benchmark_status = "Above Average"
        else:
            benchmark_status = "Below Average"

        if start_date and end_date:
            time_frame = f"{start_date.isoformat()} to {end_date.isoformat()}"
        elif start_date:
            time_frame = f"from {start_date.isoformat()}"
        elif end_date:
            time_frame = f"until {end_date.isoformat()}"
        else:
            time_frame = "all_time"

        summary = SummaryMetrics(
            total_verified_net=float(summary_doc.get("total_verified_net", 0.0) or 0.0),
            current_hourly_rate=float(summary_doc.get("current_hourly_rate", 0.0) or 0.0),
        )

        trend = [
            EarningTrendItem(
                period=str(item.get("period", "")),
                net=float(item.get("net", 0.0) or 0.0),
                effective_hourly_rate=float(item.get("effective_hourly_rate", 0.0) or 0.0),
            )
            for item in trend_docs
        ]

        platform_breakdown = [
            PlatformBreakdownItem(
                platform=str(item.get("platform", "")),
                avg_commission_rate=float(item.get("avg_commission_rate", 0.0) or 0.0),
                total_earned=float(item.get("total_earned", 0.0) or 0.0),
            )
            for item in platform_docs
            if item.get("platform")
        ]

        return WorkerDashboardResponse(
            active_filter=ActiveFilter(platform=platform, time_frame=time_frame),
            summary=summary,
            earning_trend=trend,
            platform_breakdown=platform_breakdown,
            benchmarks=BenchmarkMetrics(
                city=city_zone or "unknown",
                city_median=city_median,
                status=benchmark_status,
            ),
        )
