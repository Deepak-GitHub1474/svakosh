from __future__ import annotations

import hashlib
import json
import logging
from datetime import timedelta
from typing import Any

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
from redis.asyncio import Redis

from app.api.endpoints.auth.utils import AccessClaims
from app.api.endpoints.billing.access import (
    entitlements,
    forget_entitlements,
    valid_query,
)
from app.api.endpoints.billing.constants import (
    COL_COUPON_REDEMPTIONS,
    COL_COUPONS,
    COL_PAYMENT_EVENTS,
    COL_PAYMENTS,
    COL_PLANS,
    COL_SUBSCRIPTIONS,
    COL_USERS,
    COUPON_FLOOR_PAISE,
    COUPON_REFERRAL,
    PENDING_REUSE_MINUTES,
    PLAN_BROKER,
    PROVIDER_FREE,
    PROVIDER_RAZORPAY,
    REFERRAL_DISCOUNT_PERCENT,
    REFERRAL_MAX_USES,
    REFERRAL_REWARD_PERCENT,
    REFERRAL_WINDOW_DAYS,
    STATUS_ACTIVE,
    STATUS_FAILED,
    STATUS_PENDING,
    TOTAL_CYCLES,
    VALID_STATUSES,
)
from app.api.endpoints.billing.lifecycle import (
    abandon,
    apply_payment,
    process_event,
    referral_of,
    stop_renewal,
    sync_from_provider,
)
from app.api.endpoints.billing.models import ConfirmRequest, QuoteRequest
from app.api.endpoints.billing.utils import (
    as_utc,
    coupon_live,
    discount_for,
    from_epoch,
    iso,
    match_price,
    payment_view,
    period_end,
    plan_view,
    subscription_view,
    utc,
)
from app.razorpay import RazorpayClient, RazorpayError
from app.trade_hub import TradeHubClient
from app.utils.utils import now_utc

logger = logging.getLogger("svakosh.billing.controller")

HISTORY_LIMIT = 50


def fail(code: int, message: str) -> HTTPException:
    return HTTPException(status_code=code, detail=message)


async def list_plans(mongo: AsyncIOMotorDatabase) -> list[dict[str, Any]]:
    return [plan_view(p) async for p in mongo[COL_PLANS].find({"active": True}).sort("type", 1)]


async def overview(mongo: AsyncIOMotorDatabase, claims: AccessClaims) -> dict[str, Any]:
    subs = await mongo[COL_SUBSCRIPTIONS].find(
        {"user_id": claims.user_id, "status": {"$ne": STATUS_PENDING}}
    ).sort("created_at", -1).to_list(length=HISTORY_LIMIT)
    plans = {p["_id"]: p async for p in mongo[COL_PLANS].find({"_id": {"$in": list({s["plan_id"] for s in subs})}})}
    payments = await mongo[COL_PAYMENTS].find({"user_id": claims.user_id}).sort("paid_at", -1).to_list(length=HISTORY_LIMIT)
    return {
        "subscriptions": [subscription_view(s, plans.get(s["plan_id"])) for s in subs],
        "payments": [payment_view(p) for p in payments],
    }


async def get_entitlements(mongo: AsyncIOMotorDatabase, redis: Redis, claims: AccessClaims) -> dict[str, Any]:
    return await entitlements(mongo, redis, claims.user_id)


async def has_paid(mongo: AsyncIOMotorDatabase, user_id: str) -> bool:
    return await mongo[COL_PAYMENTS].find_one({"user_id": user_id}, {"_id": 1}) is not None


async def offer_coupon(
    mongo: AsyncIOMotorDatabase, user_id: str, code: str, plan_type: str, price: int,
) -> tuple[dict[str, Any] | None, str]:
    coupon = await mongo[COL_COUPONS].find_one({"code": code})
    if coupon is None:
        if await mongo[COL_USERS].find_one({"referral_code": code}, {"_id": 1}):
            return None, "Referral codes are applied from your profile."
        return None, "This coupon code is not valid."
    if coupon["kind"] == COUPON_REFERRAL:
        return None, "Referral codes are applied from your profile."
    if int(coupon.get("used_count", 0)) >= int(coupon.get("max_uses", 0)):
        return None, "This coupon has reached its limit."
    if not coupon_live(coupon, now_utc()):
        return None, "This coupon has expired."
    if plan_type not in coupon.get("products", []):
        return None, "This coupon does not apply to this plan."
    if price < COUPON_FLOOR_PAISE:
        return None, "Coupons apply to plans of ₹10 or more."
    used = await mongo[COL_COUPON_REDEMPTIONS].count_documents({"coupon_id": coupon["_id"], "user_id": user_id})
    if used >= int(coupon.get("per_user_limit", 1)):
        return None, "You have already used this coupon."
    return coupon, ""


async def referral_coupon(mongo: AsyncIOMotorDatabase, user_id: str) -> dict[str, Any] | None:
    if await has_paid(mongo, user_id):
        return None
    return await referral_of(mongo, user_id)


async def build_quote(
    mongo: AsyncIOMotorDatabase, trade: TradeHubClient, claims: AccessClaims, body: QuoteRequest,
) -> dict[str, Any]:
    plan = await mongo[COL_PLANS].find_one({"code": body.plan, "active": True})
    if plan is None:
        raise fail(status.HTTP_404_NOT_FOUND, "Plan not found.")
    broker, account_id, ip = None, None, None
    if plan["type"] == PLAN_BROKER:
        if not body.broker_account_id:
            raise fail(status.HTTP_400_BAD_REQUEST, "Choose a broker account.")
        accounts = await trade.call("trade.account.list", {"user_id": claims.user_id}) or []
        account = next((a for a in accounts if a.get("id") == body.broker_account_id), None)
        if account is None:
            raise fail(status.HTTP_404_NOT_FOUND, "Broker account not found.")
        broker, account_id, ip = account.get("broker"), body.broker_account_id, body.ip or "ipv4"
    entry = match_price(plan, body.tenure, broker, ip)
    if entry is None:
        raise fail(status.HTTP_400_BAD_REQUEST, "This plan is not available for the selected options.")
    price = int(entry["price_paise"])
    offer, coupon_error = (None, "")
    if body.coupon:
        offer, coupon_error = await offer_coupon(mongo, claims.user_id, body.coupon, plan["type"], price)
    candidates = [c for c in (offer, await referral_coupon(mongo, claims.user_id)) if c]
    applied = max(candidates, key=lambda c: discount_for(c, price), default=None)
    discount = discount_for(applied, price) if applied else 0
    if not discount:
        applied = None
    return {
        "plan": plan,
        "entry": entry,
        "broker": broker,
        "broker_account_id": account_id,
        "ip": ip,
        "tenure": body.tenure,
        "price_paise": price,
        "discount_paise": discount,
        "payable_paise": price - discount,
        "coupon": applied,
        "coupon_error": coupon_error,
    }


def quote_view(q: dict[str, Any]) -> dict[str, Any]:
    coupon = q["coupon"]
    return {
        "plan": plan_view(q["plan"]),
        "tenure": q["tenure"],
        "broker": q["broker"],
        "broker_account_id": q["broker_account_id"],
        "ip": q["ip"],
        "price_paise": q["price_paise"],
        "discount_paise": q["discount_paise"],
        "payable_paise": q["payable_paise"],
        "coupon": {"code": coupon["code"], "kind": coupon["kind"]} if coupon else None,
        "coupon_error": q["coupon_error"],
    }


async def quote(
    mongo: AsyncIOMotorDatabase, trade: TradeHubClient, claims: AccessClaims, body: QuoteRequest,
) -> dict[str, Any]:
    return quote_view(await build_quote(mongo, trade, claims, body))


async def provider_plan_id(mongo: AsyncIOMotorDatabase, rz: RazorpayClient, q: dict[str, Any]) -> str:
    entry = q["entry"]
    if entry.get("provider_plan_id"):
        return entry["provider_plan_id"]
    plan_id = await rz.create_plan(q["tenure"], int(entry["price_paise"]), q["plan"]["name"])
    await mongo[COL_PLANS].update_one(
        {"_id": q["plan"]["_id"]},
        {"$set": {"prices.$[p].provider_plan_id": plan_id, "updated_at": now_utc()}},
        array_filters=[{
            "p.tenure": entry["tenure"],
            "p.broker": entry.get("broker"),
            "p.ip": entry.get("ip"),
            "p.price_paise": entry["price_paise"],
            "p.provider_plan_id": None,
        }],
    )
    return plan_id


async def checkout_view(mongo: AsyncIOMotorDatabase, rz: RazorpayClient, sub: dict[str, Any], q: dict[str, Any]) -> dict[str, Any]:
    user = await mongo[COL_USERS].find_one(
        {"_id": ObjectId(sub["user_id"])}, {"email": 1, "mobile_number": 1, "profile.full_name": 1}
    ) or {}
    return {
        "subscription_id": str(sub["_id"]),
        "status": sub["status"],
        "payable_paise": q["payable_paise"],
        "razorpay": {
            "key_id": rz.key_id,
            "subscription_id": sub.get("provider_subscription_id"),
            "name": q["plan"]["name"],
            "prefill": {
                "name": (user.get("profile") or {}).get("full_name") or "",
                "email": user.get("email") or "",
                "contact": user.get("mobile_number") or "",
            },
        } if sub.get("provider_subscription_id") else None,
    }


def notes_for(sub_id: Any, user_id: str, q: dict[str, Any]) -> dict[str, str]:
    coupon = q["coupon"]
    return {
        "subscription_id": str(sub_id),
        "user_id": user_id,
        "tenure": q["tenure"],
        "payable_paise": str(q["payable_paise"]),
        "discount_paise": str(q["discount_paise"]),
        "coupon_id": str(coupon["_id"]) if coupon else "",
    }


async def checkout(
    mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, trade: TradeHubClient,
    claims: AccessClaims, body: QuoteRequest,
) -> dict[str, Any]:
    q = await build_quote(mongo, trade, claims, body)
    if body.coupon and q["coupon_error"]:
        raise fail(status.HTTP_400_BAD_REQUEST, q["coupon_error"])
    subs = mongo[COL_SUBSCRIPTIONS]
    target = {"user_id": claims.user_id, "plan_id": q["plan"]["_id"], "broker_account_id": q["broker_account_id"]}
    current = await subs.find_one({**valid_query(claims.user_id), **target})
    if current:
        until = as_utc(current.get("expires_at"))
        message = f"You already have this plan until {until:%d %b %Y}." if until else "You already have this plan."
        raise fail(status.HTTP_409_CONFLICT, message)
    now = now_utc()
    base = {**target, "tenure": q["tenure"], "ip": q["ip"], "cancelled_at": None, "created_at": now, "updated_at": now}

    if q["payable_paise"] == 0 and q["price_paise"] == 0:
        doc = {**base, "status": STATUS_ACTIVE, "auto_renew": False, "provider": PROVIDER_FREE,
               "provider_subscription_id": None, "started_at": now, "expires_at": None}
        result = await subs.insert_one(doc)
        await forget_entitlements(redis, claims.user_id)
        return {"subscription_id": str(result.inserted_id), "status": STATUS_ACTIVE, "payable_paise": 0, "razorpay": None}

    if not rz.configured:
        raise fail(status.HTTP_503_SERVICE_UNAVAILABLE, "Payments are not available right now.")

    pending = await subs.find_one({**target, "status": STATUS_PENDING})
    if pending:
        reused = await reuse_pending(mongo, redis, rz, pending, q)
        if reused is not None:
            return reused

    doc = {**base, "status": STATUS_PENDING, "auto_renew": False, "provider": PROVIDER_RAZORPAY,
           "provider_subscription_id": None, "started_at": None, "expires_at": None}
    try:
        result = await subs.insert_one(doc)
    except DuplicateKeyError as e:
        raise fail(status.HTTP_409_CONFLICT, "A checkout is already in progress. Try again in a moment.") from e
    doc["_id"] = result.inserted_id
    try:
        plan_id = await provider_plan_id(mongo, rz, q)
        remote = await rz.create_subscription(
            plan_id,
            TOTAL_CYCLES[q["tenure"]],
            int(period_end(now, q["tenure"]).timestamp()),
            q["payable_paise"],
            notes_for(doc["_id"], claims.user_id, q),
        )
    except RazorpayError as e:
        await subs.update_one({"_id": doc["_id"]}, {"$set": {"status": STATUS_FAILED, "updated_at": now_utc()}})
        raise fail(status.HTTP_503_SERVICE_UNAVAILABLE, str(e)) from e
    doc = await subs.find_one_and_update(
        {"_id": doc["_id"]},
        {"$set": {"provider_subscription_id": remote["id"], "updated_at": now_utc()}},
        return_document=ReturnDocument.AFTER,
    )
    logger.info("Billing: checkout %s created for user %s.", doc["_id"], claims.user_id)
    return await checkout_view(mongo, rz, doc, q)


async def reuse_pending(
    mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, pending: dict[str, Any], q: dict[str, Any],
) -> dict[str, Any] | None:
    if not pending.get("provider_subscription_id"):
        await abandon(mongo, redis, rz, pending)
        return None
    try:
        remote = await sync_from_provider(mongo, redis, rz, pending)
    except RazorpayError:
        remote = {}
    fresh = await mongo[COL_SUBSCRIPTIONS].find_one({"_id": pending["_id"]})
    if fresh and fresh["status"] == STATUS_ACTIVE:
        return {"subscription_id": str(fresh["_id"]), "status": STATUS_ACTIVE, "payable_paise": 0, "razorpay": None}
    notes = remote.get("notes") or {}
    recent = utc(pending["created_at"]) > now_utc() - timedelta(minutes=PENDING_REUSE_MINUTES)
    same = (
        remote.get("status") == "created"
        and notes.get("tenure") == q["tenure"]
        and pending.get("ip") == q["ip"]
        and notes.get("payable_paise") == str(q["payable_paise"])
        and notes.get("coupon_id", "") == (str(q["coupon"]["_id"]) if q["coupon"] else "")
    )
    if same and recent:
        return await checkout_view(mongo, rz, pending, q)
    await abandon(mongo, redis, rz, pending)
    return None


async def owned_subscription(mongo: AsyncIOMotorDatabase, claims: AccessClaims, query: dict[str, Any]) -> dict[str, Any]:
    sub = await mongo[COL_SUBSCRIPTIONS].find_one({**query, "user_id": claims.user_id})
    if sub is None:
        raise fail(status.HTTP_404_NOT_FOUND, "Subscription not found.")
    return sub


async def view_of(mongo: AsyncIOMotorDatabase, sub: dict[str, Any]) -> dict[str, Any]:
    plan = await mongo[COL_PLANS].find_one({"_id": sub["plan_id"]})
    return subscription_view(sub, plan)


async def confirm(
    mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, claims: AccessClaims, body: ConfirmRequest,
) -> dict[str, Any]:
    sub = await owned_subscription(mongo, claims, {"provider_subscription_id": body.razorpay_subscription_id})
    if not rz.checkout_signature_ok(body.razorpay_payment_id, body.razorpay_subscription_id, body.razorpay_signature):
        raise fail(status.HTTP_400_BAD_REQUEST, "Payment could not be verified.")
    if sub["status"] not in VALID_STATUSES:
        try:
            payment = await rz.fetch_payment(body.razorpay_payment_id)
            remote = await rz.fetch_subscription(body.razorpay_subscription_id)
        except RazorpayError as e:
            logger.warning("Billing: confirm of %s deferred.\nReason: %s", sub["_id"], e)
            return await view_of(mongo, sub)
        start = from_epoch(payment.get("created_at")) or now_utc()
        end = from_epoch(remote.get("start_at")) or period_end(start, sub["tenure"])
        await apply_payment(mongo, redis, sub, payment, start, end, remote.get("notes") or {}, first=True)
        sub = await mongo[COL_SUBSCRIPTIONS].find_one({"_id": sub["_id"]}) or sub
    return await view_of(mongo, sub)


async def subscription_status(mongo: AsyncIOMotorDatabase, claims: AccessClaims, subscription_id: str) -> dict[str, Any]:
    return await view_of(mongo, await owned_subscription(mongo, claims, {"_id": ObjectId(subscription_id)}))


async def cancel(
    mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, claims: AccessClaims, subscription_id: str,
) -> dict[str, Any]:
    sub = await owned_subscription(mongo, claims, {"_id": ObjectId(subscription_id)})
    if sub["status"] != STATUS_ACTIVE or not sub.get("auto_renew"):
        raise fail(status.HTTP_409_CONFLICT, "Autopay is not active on this subscription.")
    try:
        await rz.cancel_subscription(sub["provider_subscription_id"])
    except RazorpayError as e:
        raise fail(status.HTTP_503_SERVICE_UNAVAILABLE, str(e)) from e
    await stop_renewal(mongo, redis, sub)
    return await view_of(mongo, await mongo[COL_SUBSCRIPTIONS].find_one({"_id": sub["_id"]}) or sub)


async def referral(mongo: AsyncIOMotorDatabase, claims: AccessClaims) -> dict[str, Any]:
    user = await mongo[COL_USERS].find_one(
        {"_id": ObjectId(claims.user_id)}, {"referral_code": 1, "referred_by": 1, "referred_at": 1, "created_at": 1}
    )
    if user is None:
        raise fail(status.HTTP_404_NOT_FOUND, "User not found.")
    code = user.get("referral_code")
    coupon = await mongo[COL_COUPONS].find_one({"code": code, "kind": COUPON_REFERRAL}) if code else None
    rewards = await mongo[COL_COUPON_REDEMPTIONS].aggregate([
        {"$match": {"referrer_user_id": claims.user_id}},
        {"$group": {"_id": "$payout_status", "count": {"$sum": 1}, "paise": {"$sum": "$reward_paise"}}},
    ]).to_list(length=10)
    totals = {r["_id"]: r for r in rewards}
    created = as_utc(user.get("created_at"))
    apply_until = created + timedelta(days=REFERRAL_WINDOW_DAYS) if created else None
    referred = bool(user.get("referred_at"))
    return {
        "code": code,
        "used_count": int(coupon.get("used_count", 0)) if coupon else 0,
        "max_uses": int(coupon.get("max_uses", REFERRAL_MAX_USES)) if coupon else REFERRAL_MAX_USES,
        "discount_percent": int(coupon.get("discount_value", REFERRAL_DISCOUNT_PERCENT)) if coupon else REFERRAL_DISCOUNT_PERCENT,
        "reward_percent": int(coupon.get("referral_reward_percent", REFERRAL_REWARD_PERCENT)) if coupon else REFERRAL_REWARD_PERCENT,
        "referrals": sum(r["count"] for r in rewards),
        "pending_paise": totals.get("pending", {}).get("paise", 0),
        "paid_paise": totals.get("paid", {}).get("paise", 0),
        "referred_by": user.get("referred_by") if referred else None,
        "apply_until": iso(apply_until),
        "can_apply": not referred and apply_until is not None and apply_until > now_utc(),
    }


async def apply_referral(mongo: AsyncIOMotorDatabase, claims: AccessClaims, code: str) -> dict[str, Any]:
    users = mongo[COL_USERS]
    user = await users.find_one(
        {"_id": ObjectId(claims.user_id)}, {"referral_code": 1, "referred_at": 1, "created_at": 1}
    )
    if user is None:
        raise fail(status.HTTP_404_NOT_FOUND, "User not found.")
    if user.get("referred_at"):
        raise fail(status.HTTP_409_CONFLICT, "A referral code is already applied to your account.")
    created = as_utc(user.get("created_at"))
    if created is None or created + timedelta(days=REFERRAL_WINDOW_DAYS) < now_utc():
        raise fail(status.HTTP_400_BAD_REQUEST,
                   f"Referral codes can be applied within {REFERRAL_WINDOW_DAYS} days of signing up. This window has ended.")
    if code == user.get("referral_code"):
        raise fail(status.HTTP_400_BAD_REQUEST, "You can't use your own referral code.")
    if await has_paid(mongo, claims.user_id):
        raise fail(status.HTTP_400_BAD_REQUEST, "Referral codes apply before your first purchase.")
    owner = await users.find_one({"referral_code": code}, {"_id": 1})
    if owner is None:
        raise fail(status.HTTP_404_NOT_FOUND, "Invalid referral code.")
    now = now_utc()
    coupons = mongo[COL_COUPONS]
    await coupons.update_one(
        {"code": code},
        {"$setOnInsert": {
            "code": code, "kind": COUPON_REFERRAL, "owner_user_id": str(owner["_id"]),
            "products": ["analytics", "broker"], "discount_type": "percent",
            "discount_value": REFERRAL_DISCOUNT_PERCENT, "max_uses": REFERRAL_MAX_USES, "per_user_limit": 1,
            "used_count": 0, "referral_reward_percent": REFERRAL_REWARD_PERCENT, "public": False,
            "active": True, "starts_at": None, "ends_at": None, "created_at": now, "updated_at": now,
        }},
        upsert=True,
    )
    claimed = await coupons.find_one_and_update(
        {"code": code, "kind": COUPON_REFERRAL, "active": True, "$expr": {"$lt": ["$used_count", "$max_uses"]}},
        {"$inc": {"used_count": 1}, "$set": {"updated_at": now}},
    )
    if claimed is None:
        raise fail(status.HTTP_409_CONFLICT, "This referral code has reached its limit.")
    res = await users.update_one(
        {"_id": user["_id"], "referred_at": {"$exists": False}},
        {"$set": {"referred_by": code, "referred_at": now, "updated_at": now}},
    )
    if res.modified_count == 0:
        await coupons.update_one({"_id": claimed["_id"]}, {"$inc": {"used_count": -1}})
        raise fail(status.HTTP_409_CONFLICT, "A referral code is already applied to your account.")
    return await referral(mongo, claims)


async def webhook(
    mongo: AsyncIOMotorDatabase, redis: Redis, rz: RazorpayClient, body: bytes, signature: str, event_id: str,
) -> None:
    if not rz.webhook_signature_ok(body, signature):
        raise fail(status.HTTP_400_BAD_REQUEST, "Invalid signature.")
    try:
        event = json.loads(body)
    except json.JSONDecodeError as e:
        raise fail(status.HTTP_400_BAD_REQUEST, "Invalid payload.") from e
    key = f"razorpay:{event_id or hashlib.sha256(body).hexdigest()}"
    try:
        await mongo[COL_PAYMENT_EVENTS].insert_one({
            "_id": key,
            "type": event.get("event", ""),
            "payload": event,
            "received_at": now_utc(),
            "processed_at": None,
            "error": "",
        })
    except DuplicateKeyError:
        return
    await process_event(mongo, redis, key)
