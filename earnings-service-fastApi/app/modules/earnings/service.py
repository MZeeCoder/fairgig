from beanie import PydanticObjectId

from app.modules.earnings.model import Earnings


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
