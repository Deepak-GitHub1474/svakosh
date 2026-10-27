from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError
from redis.asyncio import Redis

from app.api.endpoints.billing.access import forget_entitlements
from app.api.endpoints.billing.constants import (
    COL_COUPON_REDEMPTIONS,
    COL_COUPONS,
    COL_PAYMENT_EVENTS,
    COL_PAYMENTS,
    COL_PLANS,
    COL_SUBSCRIPTIONS,
    COL_USERS,
    COUPON_OFFER,
    COUPON_REFERRAL,
    EVENT_RETRY_AFTER_SECONDS,
    PENDING_SYNC_MINUTES,
    PROVIDER_RAZORPAY,
    RENEWAL_GRACE_HOURS,
    STATUS_ACTIVE,
    STATUS_CANCELLED,
    STATUS_EXPIRED,
    STATUS_FAILED,
    STATUS_PENDING,
    TRIAL_NOTE,
    TRIAL_TENURE,
    VALID_STATUSES,
)
from app.api.endpoints.billing.utils import end_of_day, from_epoch, period_end
from app.razorpay import RazorpayClient, RazorpayError
from app.utils.utils import now_utc

logger = logging.getLogger("svakosh.billing.lifecycle")

PAID_STATES = ("captured", "authorized")
FIRST_PAYMENT_EVENTS = ("subscription.authenticated", "subscription.activated")
STOP_EVENTS = ("subscription.cancelled", "subscription.completed", "subscription.halted")


async def apply_payment(
    mongo: AsyncIOMotorDatabase,
    redis: Redis,
    sub: dict[str, Any],
    payment: dict[str, Any],
    start: datetime,
    end: datetime,
    notes: dict[str, Any],
    first: bool,
) -> None:
    if payment.get("status") not in PAID_STATES:
        return
    now = now_utc()
    end = end_of_day(end)
    coupon_id = notes.get("coupon_id") if first else None
    discount = int(notes.get("discount_paise") or 0) if first else 0
    doc = {
        "subscription_id": sub["_id"],
        "user_id": sub["user_id"],
        "provider_payment_id": payment["id"],
        "amount_paise": int(payment["amount"]),
        "discount_paise": discount,
        "coupon_id": ObjectId(coupon_id) if coupon_id else None,
        "period_start": start,
        "period_end": end,
        "status": "captured",
        "paid_at": from_epoch(payment.get("created_at")) or now,
        "created_at": now,
        "updated_at": now,
    }
    try:
        await mongo[COL_PAYMENTS].insert_one(doc)
    except DuplicateKeyError:
        doc = await mongo[COL_PAYMENTS].find_one({"provider_payment_id": payment["id"]})
    subs = mongo[COL_SUBSCRIPTIONS]
    if first:
        await subs.update_one(
            {"_id": sub["_id"], "status": {"$in": [STATUS_PENDING, STATUS_FAILED]}},
            {"$set": {"status": STATUS_ACTIVE, "started_at": start, "auto_renew": True, "updated_at": now}},
        )
    else:
        await subs.update_one(
            {"_id": sub["_id"], "status": STATUS_EXPIRED},
            {"$set": {"status": STATUS_ACTIVE, "updated_at": now}},
        )
    await subs.update_one(
        {"_id": sub["_id"]},
        {"$max": {"expires_at": end}, "$set": {"updated_at": now}},
    )
    if doc:
        await redeem(mongo, doc)
    await forget_entitlements(redis, sub["user_id"])
    logger.info("Billing: payment %s applied to subscription %s.", payment["id"], sub["_id"])


async def referral_of(mongo: AsyncIOMotorDatabase, user_id: str) -> dict[str, Any] | None:
    if not ObjectId.is_valid(user_id):
        return None
    user = await mongo[COL_USERS].find_one({"_id": ObjectId(user_id)}, {"referred_by": 1, "referred_at": 1})
    if not user or not user.get("referred_at"):
        return None
    return await mongo[COL_COUPONS].find_one({"code": user.get("referred_by"), "kind": COUPON_REFERRAL, "active": True})


async def record(mongo: AsyncIOMotorDatabase, coupon: dict[str, Any], payment: dict[str, Any], discount: int, reward: int) -> bool:
    now = now_utc()
    referral = coupon["kind"] == COUPON_REFERRAL
    try:
        await mongo[COL_COUPON_REDEMPTIONS].insert_one({
            "coupon_id": coupon["_id"],
            "user_id": payment["user_id"],
            "payment_id": payment["_id"],
            "discount_paise": discount,
            "referrer_user_id": coupon.get("owner_user_id") if referral else None,
            "reward_paise": reward,
            "payout_status": "pending" if referral else None,
            "created_at": now,
            "updated_at": now,
        })
    except DuplicateKeyError:
        return False
    return True


async def redeem(mongo: AsyncIOMotorDatabase, payment: dict[str, Any]) -> None:
    applied = await mongo[COL_COUPONS].find_one({"_id": payment["coupon_id"]}) if payment.get("coupon_id") else None
    if applied and applied["kind"] == COUPON_OFFER and await record(mongo, applied, payment, payment["discount_paise"], 0):
        await mongo[COL_COUPONS].update_one({"_id": applied["_id"]}, {"$inc": {"used_count": 1}, "$set": {"updated_at": now_utc()}})
    if payment["amount_paise"] <= 0:
        return
    referral = applied if applied and applied["kind"] == COUPON_REFERRAL else await referral_of(mongo, payment["user_id"])
    if referral is None:
        return
    earlier = await mongo[COL_PAYMENTS].find_one(
        {"user_id": payment["user_id"], "_id": {"$ne": payment["_id"]}, "amount_paise": {"$gt": 0}}, {"_id": 1}
    )
    if earlier is not None:
        return
    discount = payment["discount_paise"] if referral is applied else 0
    reward = payment["amount_paise"] * int(referral.get("referral_reward_percent", 0)) // 100
    await record(mongo, referral, payment, discount, reward)


def is_trial(notes: dict[str, Any]) -> bool:
    return notes.get("trial") == TRIAL_NOTE


async def claim_trial(mongo: AsyncIOMotorDatabase, sub: dict[str, Any]) -> bool:
    plan = await mongo[COL_PLANS].find_one({"_id": sub["plan_id"]}, {"type": 1})
    if plan is None or not ObjectId.is_valid(sub["user_id"]):
        return False
    field = f"trial_claims.{plan['type']}"
    user_id = ObjectId(sub["user_id"])
    claimed = await mongo[COL_USERS].update_one(
        {"_id": user_id, field: {"$exists": False}}, {"$set": {field: str(sub["_id"])}}
    )
    if claimed.modified_count:
        return True
    user = await mongo[COL_USERS].find_one({"_id": user_id}, {"trial_claims": 1}) or {}
    return (user.get("trial_claims") or {}).get(plan["type"]) == str(sub["_id"])


async def activate_trial(
    mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, sub: dict[str, Any], remote: dict[str, Any],
) -> None:
    if not await claim_trial(mongo, sub):
        logger.warning("Billing: second free month refused for subscription %s.", sub["_id"])
        await abandon(mongo, redis, rz, sub)
        return
    start = from_epoch(remote.get("created_at")) or now_utc()
    end = from_epoch(remote.get("start_at")) or period_end(start, TRIAL_TENURE)
    payment = {"id": f"trial:{remote['id']}", "amount": 0, "status": "captured", "created_at": remote.get("created_at")}
    await apply_payment(mongo, redis, sub, payment, start, end, remote.get("notes") or {}, first=True)


async def stop_renewal(mongo: AsyncIOMotorDatabase, redis: Redis, sub: dict[str, Any]) -> None:
    now = now_utc()
    await mongo[COL_SUBSCRIPTIONS].update_one(
        {"_id": sub["_id"], "status": STATUS_ACTIVE},
        {"$set": {"status": STATUS_CANCELLED, "auto_renew": False, "cancelled_at": now, "updated_at": now}},
    )
    await mongo[COL_SUBSCRIPTIONS].update_one(
        {"_id": sub["_id"], "status": STATUS_PENDING},
        {"$set": {"status": STATUS_FAILED, "auto_renew": False, "updated_at": now}},
    )
    await forget_entitlements(redis, sub["user_id"])


async def handle_event(mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, event: dict[str, Any]) -> None:
    kind = event.get("event", "")
    payload = event.get("payload") or {}
    if kind == "refund.processed":
        refund = (payload.get("refund") or {}).get("entity") or {}
        await mongo[COL_PAYMENTS].update_one(
            {"provider_payment_id": refund.get("payment_id")},
            {"$set": {"status": "refunded", "updated_at": now_utc()}},
        )
        return
    entity = (payload.get("subscription") or {}).get("entity") or {}
    sub = await mongo[COL_SUBSCRIPTIONS].find_one({"provider_subscription_id": entity.get("id")}) if entity else None
    if sub is None:
        return
    payment = (payload.get("payment") or {}).get("entity")
    notes = entity.get("notes") or {}
    if kind == "subscription.charged" and payment:
        start, end = from_epoch(entity.get("current_start")), from_epoch(entity.get("current_end"))
        if start and end:
            await apply_payment(mongo, redis, sub, payment, start, end, notes, first=False)
    elif kind in FIRST_PAYMENT_EVENTS and is_trial(notes):
        await activate_trial(mongo, redis, rz, sub, entity)
    elif kind in FIRST_PAYMENT_EVENTS and payment:
        start = from_epoch(payment.get("created_at")) or now_utc()
        end = from_epoch(entity.get("start_at")) or period_end(start, sub["tenure"])
        await apply_payment(mongo, redis, sub, payment, start, end, notes, first=True)
    elif kind in STOP_EVENTS:
        await stop_renewal(mongo, redis, sub)


async def process_event(mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, event_id: str) -> None:
    doc = await mongo[COL_PAYMENT_EVENTS].find_one({"_id": event_id, "processed_at": None})
    if doc is None:
        return
    try:
        await handle_event(mongo, redis, rz, doc["payload"])
    except Exception as e:
        logger.exception("Billing: event %s failed.", event_id)
        await mongo[COL_PAYMENT_EVENTS].update_one({"_id": event_id}, {"$set": {"error": f"{type(e).__name__}: {e}"}})
        return
    await mongo[COL_PAYMENT_EVENTS].update_one({"_id": event_id}, {"$set": {"processed_at": now_utc(), "error": ""}})


async def sync_from_provider(
    mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, sub: dict[str, Any],
) -> dict[str, Any]:
    remote = await rz.fetch_subscription(sub["provider_subscription_id"])
    notes = remote.get("notes") or {}
    trial = is_trial(notes)
    if trial and remote.get("status") in ("authenticated", "active"):
        await activate_trial(mongo, redis, rz, sub, remote)
    invoices = sorted(await rz.paid_invoices(remote["id"]), key=lambda i: i.get("paid_at") or i.get("created_at") or 0)
    for index, invoice in enumerate(invoices):
        payment = await rz.fetch_payment(invoice["payment_id"])
        first = index == 0 and not trial
        if first:
            start = from_epoch(payment.get("created_at")) or now_utc()
            end = from_epoch(remote.get("start_at")) or period_end(start, sub["tenure"])
        else:
            start = from_epoch(invoice.get("billing_start")) or from_epoch(remote.get("current_start"))
            end = from_epoch(invoice.get("billing_end")) or from_epoch(remote.get("current_end"))
            if not (start and end):
                continue
        await apply_payment(mongo, redis, sub, payment, start, end, notes, first=first)
    if remote.get("status") in ("cancelled", "completed", "halted", "expired"):
        await stop_renewal(mongo, redis, sub)
    return remote


async def reconcile(mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient) -> None:
    now = now_utc()
    retry_before = now - timedelta(seconds=EVENT_RETRY_AFTER_SECONDS)
    async for event in mongo[COL_PAYMENT_EVENTS].find({"processed_at": None, "received_at": {"$lt": retry_before}}, {"_id": 1}):
        await process_event(mongo, redis, rz, event["_id"])

    subs = mongo[COL_SUBSCRIPTIONS]
    if rz.configured:
        stale = {"provider": PROVIDER_RAZORPAY, "provider_subscription_id": {"$type": "string"}}
        checks = [
            {**stale, "status": STATUS_PENDING, "created_at": {"$lt": now - timedelta(minutes=PENDING_SYNC_MINUTES)}},
            {**stale, "status": STATUS_ACTIVE, "auto_renew": True, "expires_at": {"$lt": now}},
        ]
        for query in checks:
            async for sub in subs.find(query):
                try:
                    await sync_from_provider(mongo, redis, rz, sub)
                except RazorpayError as e:
                    logger.warning("Billing: reconcile of %s skipped.\nReason: %s", sub["_id"], e)
                    continue
                if sub["status"] == STATUS_PENDING:
                    fresh = await subs.find_one({"_id": sub["_id"]}, {"status": 1})
                    if fresh and fresh["status"] == STATUS_PENDING:
                        await abandon(mongo, redis, rz, sub)

    await subs.update_many(
        {
            "status": {"$in": list(VALID_STATUSES)},
            "$or": [
                {"auto_renew": False, "expires_at": {"$lt": now}},
                {"expires_at": {"$lt": now - timedelta(hours=RENEWAL_GRACE_HOURS)}},
            ],
        },
        {"$set": {"status": STATUS_EXPIRED, "auto_renew": False, "updated_at": now}},
    )


async def abandon(mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, sub: dict[str, Any]) -> None:
    if sub.get("provider_subscription_id"):
        try:
            await rz.cancel_subscription(sub["provider_subscription_id"])
        except RazorpayError as e:
            logger.warning("Billing: cancel of abandoned %s failed.\nReason: %s", sub["_id"], e)
    await mongo[COL_SUBSCRIPTIONS].update_one(
        {"_id": sub["_id"], "status": STATUS_PENDING},
        {"$set": {"status": STATUS_FAILED, "updated_at": now_utc()}},
    )
    await forget_entitlements(redis, sub["user_id"])
