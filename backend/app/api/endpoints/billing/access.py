from __future__ import annotations

import json
from datetime import timedelta
from typing import Any

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.api.endpoints.auth.utils import AccessClaims
from app.api.endpoints.billing.constants import (
    COL_PLANS,
    COL_SUBSCRIPTIONS,
    ENTITLEMENT_CACHE_KEY,
    ENTITLEMENT_CACHE_SECONDS,
    PLAN_BROKER,
    RENEWAL_GRACE_HOURS,
    VALID_STATUSES,
)
from app.utils.utils import now_utc


def valid_query(user_id: str) -> dict[str, Any]:
    now = now_utc()
    return {
        "user_id": user_id,
        "status": {"$in": list(VALID_STATUSES)},
        "$or": [
            {"expires_at": None},
            {"expires_at": {"$gt": now}},
            {"auto_renew": True, "expires_at": {"$gt": now - timedelta(hours=RENEWAL_GRACE_HOURS)}},
        ],
    }


async def entitlements(mongo: AsyncIOMotorDatabase, redis: Redis, user_id: str) -> dict[str, Any]:
    key = ENTITLEMENT_CACHE_KEY.format(user_id)
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)
    subs = await mongo[COL_SUBSCRIPTIONS].find(
        valid_query(user_id), {"plan_id": 1, "broker_account_id": 1}
    ).to_list(length=200)
    plans = {
        p["_id"]: p
        async for p in mongo[COL_PLANS].find(
            {"_id": {"$in": list({s["plan_id"] for s in subs})}}, {"type": 1, "features": 1}
        )
    }
    features: set[str] = set()
    accounts: set[str] = set()
    for sub in subs:
        plan = plans.get(sub["plan_id"])
        if plan is None:
            continue
        if plan["type"] == PLAN_BROKER:
            if sub.get("broker_account_id"):
                accounts.add(sub["broker_account_id"])
        else:
            features.update(plan.get("features", []))
    result = {"features": sorted(features), "broker_accounts": sorted(accounts)}
    await redis.set(key, json.dumps(result), ex=ENTITLEMENT_CACHE_SECONDS)
    return result


async def forget_entitlements(redis: Redis, user_id: str) -> None:
    await redis.delete(ENTITLEMENT_CACHE_KEY.format(user_id))


async def require_broker_subscription(
    mongo: AsyncIOMotorDatabase, redis: Redis, claims: AccessClaims, account_id: str,
) -> None:
    if claims.role == "admin":
        return
    granted = await entitlements(mongo, redis, claims.user_id)
    if account_id and account_id in granted["broker_accounts"]:
        return
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail={
            "message": "Subscribe this broker account to place orders.",
            "code": "SUBSCRIPTION_REQUIRED",
            "account_id": account_id,
        },
    )
