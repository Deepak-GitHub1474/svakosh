from __future__ import annotations

import calendar
from datetime import UTC, datetime, timedelta, timezone
from typing import Any

from app.api.endpoints.billing.constants import COUPON_FLOOR_PAISE, TENURE_MONTHS


def as_utc(value: datetime | None) -> datetime | None:
    if value is None or value.tzinfo is not None:
        return value
    return value.replace(tzinfo=UTC)


def utc(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def from_epoch(seconds: int | None) -> datetime | None:
    return datetime.fromtimestamp(seconds, UTC) if seconds else None


IST = timezone(timedelta(hours=5, minutes=30))


def end_of_day(value: datetime) -> datetime:
    local = utc(value).astimezone(IST)
    return local.replace(hour=23, minute=59, second=59, microsecond=0).astimezone(UTC)


def period_end(start: datetime, tenure: str) -> datetime:
    local = utc(start).astimezone(IST)
    months = local.month - 1 + TENURE_MONTHS[tenure]
    year, month = local.year + months // 12, months % 12 + 1
    day = min(local.day, calendar.monthrange(year, month)[1])
    return end_of_day(local.replace(year=year, month=month, day=day))


def ip_supported(plan: dict[str, Any], broker: str | None, ip: str | None) -> bool:
    allowed = (plan.get("ip_brokers") or {}).get(ip or "")
    return allowed is None or broker in allowed


def match_price(plan: dict[str, Any], tenure: str, broker: str | None, ip: str | None) -> dict[str, Any] | None:
    if not ip_supported(plan, broker, ip):
        return None
    best, best_score = None, -1
    for entry in plan.get("prices", []):
        if entry["tenure"] != tenure:
            continue
        if entry.get("broker") not in (None, broker) or entry.get("ip") not in (None, ip):
            continue
        score = (entry.get("broker") is not None) * 2 + (entry.get("ip") is not None)
        if score > best_score:
            best, best_score = entry, score
    return best


def discount_for(coupon: dict[str, Any], price_paise: int) -> int:
    if price_paise < COUPON_FLOOR_PAISE:
        return 0
    if coupon["discount_type"] == "percent":
        raw = price_paise * int(coupon["discount_value"]) // 100
    else:
        raw = int(coupon["discount_value"])
    return max(0, min(raw, price_paise - COUPON_FLOOR_PAISE))


def coupon_live(coupon: dict[str, Any], now: datetime) -> bool:
    starts, ends = as_utc(coupon.get("starts_at")), as_utc(coupon.get("ends_at"))
    return (
        bool(coupon.get("active"))
        and (starts is None or starts <= now)
        and (ends is None or ends > now)
        and int(coupon.get("used_count", 0)) < int(coupon.get("max_uses", 0))
    )


def iso(value: datetime | None) -> str | None:
    value = as_utc(value)
    return value.isoformat() if value else None


def plan_view(plan: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(plan["_id"]),
        "code": plan["code"],
        "name": plan["name"],
        "type": plan["type"],
        "description": plan.get("description", ""),
        "features": plan.get("features", []),
        "ip_brokers": plan.get("ip_brokers") or {},
        "prices": [
            {k: p.get(k) for k in ("tenure", "broker", "ip", "price_paise")}
            for p in plan.get("prices", [])
        ],
    }


def subscription_view(sub: dict[str, Any], plan: dict[str, Any] | None) -> dict[str, Any]:
    return {
        "id": str(sub["_id"]),
        "plan": plan_view(plan) if plan else None,
        "tenure": sub["tenure"],
        "ip": sub.get("ip"),
        "broker_account_id": sub.get("broker_account_id"),
        "status": sub["status"],
        "auto_renew": sub.get("auto_renew", False),
        "provider": sub.get("provider"),
        "started_at": iso(sub.get("started_at")),
        "expires_at": iso(sub.get("expires_at")),
        "cancelled_at": iso(sub.get("cancelled_at")),
        "created_at": iso(sub.get("created_at")),
    }


def payment_view(payment: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(payment["_id"]),
        "subscription_id": str(payment["subscription_id"]),
        "amount_paise": payment["amount_paise"],
        "discount_paise": payment.get("discount_paise", 0),
        "period_start": iso(payment.get("period_start")),
        "period_end": iso(payment.get("period_end")),
        "status": payment["status"],
        "reference": payment.get("provider_payment_id", ""),
        "paid_at": iso(payment.get("paid_at")),
    }
