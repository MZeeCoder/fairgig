import numpy as np
from beanie import PydanticObjectId

from app.modules.earnings.model import Earnings, EarningsStatus


class AnomalyDetectionService:
    HISTORY_LIMIT = 20
    MIN_HISTORY_REQUIRED = 5
    ZSCORE_THRESHOLD = 2.5
    INCOME_DROP_THRESHOLD = 0.40

    @staticmethod
    def _safe_ratio(numerator: float, denominator: float) -> float:
        if denominator <= 0:
            return 0.0
        return float(numerator) / float(denominator)

    @staticmethod
    async def detect(new_earning_id: str, worker_id: str) -> dict:
        try:
            earning_object_id = PydanticObjectId(new_earning_id)
        except Exception as exc:
            raise ValueError("Invalid new_earning_id") from exc

        try:
            worker_object_id = PydanticObjectId(worker_id)
        except Exception as exc:
            raise ValueError("Invalid worker_id") from exc

        current_earning = await Earnings.find_one(
            Earnings.id == earning_object_id,
            Earnings.worker_id == worker_object_id,
        )
        if not current_earning:
            raise LookupError("Earning not found")

        history_query = (
            Earnings.find(
                Earnings.worker_id == worker_object_id,
                Earnings.status == EarningsStatus.VERIFIED,
                Earnings.id != current_earning.id,
            )
            .sort(-Earnings.date)
            .limit(AnomalyDetectionService.HISTORY_LIMIT)
        )
        history = await history_query.to_list()

        if len(history) < AnomalyDetectionService.MIN_HISTORY_REQUIRED:
            return {
                "is_anomaly": False,
                "anomaly_type": "none",
                "explanation": (
                    "No anomaly detected yet. More verified earnings history is needed "
                    "before statistical checks can run reliably."
                ),
            }

        historical_deduction_ratios = np.array(
            [
                AnomalyDetectionService._safe_ratio(item.deduction, item.gross_earned)
                for item in history
            ],
            dtype=float,
        )
        current_deduction_ratio = AnomalyDetectionService._safe_ratio(
            current_earning.deduction,
            current_earning.gross_earned,
        )

        historical_mean = float(np.mean(historical_deduction_ratios))
        historical_std = float(np.std(historical_deduction_ratios))

        deduction_zscore = 0.0
        if historical_std > 0:
            deduction_zscore = (current_deduction_ratio - historical_mean) / historical_std

        historical_hourly_values = np.array(
            [
                AnomalyDetectionService._safe_ratio(item.net_received, item.hours_worked)
                for item in history
            ],
            dtype=float,
        )
        historical_hourly_avg = float(np.mean(historical_hourly_values))

        current_hourly = AnomalyDetectionService._safe_ratio(
            current_earning.net_received,
            current_earning.hours_worked,
        )

        income_drop_pct = 0.0
        if historical_hourly_avg > 0:
            income_drop_pct = max(0.0, (historical_hourly_avg - current_hourly) / historical_hourly_avg)

        high_deduction = deduction_zscore > AnomalyDetectionService.ZSCORE_THRESHOLD
        sudden_income_drop = income_drop_pct >= AnomalyDetectionService.INCOME_DROP_THRESHOLD

        if high_deduction:
            return {
                "is_anomaly": True,
                "anomaly_type": "high_deduction",
                "explanation": (
                    f"Your deduction of {current_deduction_ratio * 100:.1f}% is significantly "
                    f"higher than your recent average of {historical_mean * 100:.1f}% "
                    f"(z-score: {deduction_zscore:.2f})."
                ),
            }

        if sudden_income_drop:
            return {
                "is_anomaly": True,
                "anomaly_type": "income_drop",
                "explanation": (
                    f"Your hourly earnings dropped by {income_drop_pct * 100:.1f}% compared "
                    f"to your recent average (${historical_hourly_avg:.2f}/hr to ${current_hourly:.2f}/hr)."
                ),
            }

        deduction_shift = current_deduction_ratio - historical_mean
        direction = "above" if deduction_shift >= 0 else "below"
        return {
            "is_anomaly": False,
            "anomaly_type": "none",
            "explanation": (
                f"No statistical anomaly detected. Your deduction ratio is {abs(deduction_shift) * 100:.1f}% "
                f"{direction} your recent average, and your hourly earnings did not cross the 40% drop threshold."
            ),
        }
