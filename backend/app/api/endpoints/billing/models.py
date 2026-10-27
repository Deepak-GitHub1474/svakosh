from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


def _code(v: Any) -> Any:
    return v.strip().upper() if isinstance(v, str) else v


CouponCode = Annotated[str, BeforeValidator(_code), Field(min_length=3, max_length=32, pattern=r"^[A-Z0-9_-]+$")]
Tenure = Literal["monthly", "quarterly", "annually"]
StatusFilter = Literal["all", "active", "expired", "pending", "failed"]
PlanFilter = Literal["all", "analytics", "broker"]


class QuoteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan: str = Field(..., min_length=1, max_length=40)
    tenure: Tenure
    broker_account_id: str | None = Field(None, pattern=r"^[a-f0-9]{24}$")
    ip: Literal["ipv4", "ipv6"] | None = None
    coupon: CouponCode | None = None


class ConfirmRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    razorpay_payment_id: str = Field(..., min_length=5, max_length=64)
    razorpay_subscription_id: str = Field(..., min_length=5, max_length=64)
    razorpay_signature: str = Field(..., min_length=10, max_length=200)


class ReferralRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: CouponCode
