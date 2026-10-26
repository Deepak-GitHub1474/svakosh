from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel

from app.api.endpoints.billing.constants import (
    COL_COUPON_REDEMPTIONS,
    COL_COUPONS,
    COL_PAYMENT_EVENTS,
    COL_PAYMENTS,
    COL_PLANS,
    COL_SUBSCRIPTIONS,
    DEFAULT_PLANS,
    STATUS_PENDING,
)
from app.utils.utils import now_utc

INDEXES = {
    COL_PLANS: [IndexModel([("code", ASCENDING)], name="code_unique", unique=True)],
    COL_SUBSCRIPTIONS: [
        IndexModel([("user_id", ASCENDING), ("plan_id", ASCENDING)], name="user_plan"),
        IndexModel([("broker_account_id", ASCENDING)], name="broker_account"),
        IndexModel([("status", ASCENDING), ("expires_at", ASCENDING)], name="status_expiry"),
        IndexModel(
            [("provider_subscription_id", ASCENDING)],
            name="provider_subscription_unique",
            unique=True,
            partialFilterExpression={"provider_subscription_id": {"$type": "string"}},
        ),
        IndexModel(
            [("user_id", ASCENDING), ("plan_id", ASCENDING), ("broker_account_id", ASCENDING)],
            name="one_pending_checkout",
            unique=True,
            partialFilterExpression={"status": STATUS_PENDING},
        ),
    ],
    COL_PAYMENTS: [
        IndexModel([("provider_payment_id", ASCENDING)], name="provider_payment_unique", unique=True),
        IndexModel([("user_id", ASCENDING), ("paid_at", DESCENDING)], name="user_paid"),
        IndexModel([("subscription_id", ASCENDING)], name="subscription"),
    ],
    COL_PAYMENT_EVENTS: [IndexModel([("processed_at", ASCENDING)], name="processed")],
    COL_COUPONS: [
        IndexModel([("code", ASCENDING)], name="code_unique", unique=True),
        IndexModel([("owner_user_id", ASCENDING)], name="owner"),
    ],
    COL_COUPON_REDEMPTIONS: [
        IndexModel([("payment_id", ASCENDING), ("coupon_id", ASCENDING)], name="payment_coupon_unique", unique=True),
        IndexModel([("coupon_id", ASCENDING), ("user_id", ASCENDING)], name="coupon_user"),
        IndexModel([("referrer_user_id", ASCENDING), ("payout_status", ASCENDING)], name="referrer_payout"),
    ],
}


async def ensure_billing_setup(mongo: AsyncIOMotorDatabase) -> None:
    for collection, indexes in INDEXES.items():
        await mongo[collection].create_indexes(indexes)
    now = now_utc()
    for plan in DEFAULT_PLANS:
        await mongo[COL_PLANS].update_one(
            {"code": plan["code"]},
            {"$setOnInsert": {**plan, "active": True, "created_at": now, "updated_at": now}},
            upsert=True,
        )
