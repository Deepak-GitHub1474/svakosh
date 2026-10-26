from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Any

import httpx
from fastapi import Request

logger = logging.getLogger("svakosh.razorpay")

BASE_URL = "https://api.razorpay.com/v1"
TIMEOUT_SECONDS = 15.0
PERIODS = {"monthly": ("monthly", 1), "quarterly": ("monthly", 3), "annually": ("yearly", 1)}


class RazorpayError(Exception):
    pass


def signature_ok(secret: str, message: bytes, signature: str) -> bool:
    expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return bool(signature) and hmac.compare_digest(expected, signature)


class RazorpayClient:
    def __init__(self, key_id: str, key_secret: str, webhook_secret: str, base_url: str = BASE_URL) -> None:
        self.key_id = key_id
        self.key_secret = key_secret
        self.webhook_secret = webhook_secret
        self.http = httpx.AsyncClient(base_url=base_url, auth=(key_id, key_secret), timeout=TIMEOUT_SECONDS)

    @property
    def configured(self) -> bool:
        return bool(self.key_id and self.key_secret)

    async def close(self) -> None:
        await self.http.aclose()

    async def call(self, method: str, path: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
        if not self.configured:
            raise RazorpayError("Payments are not configured.")
        try:
            res = await self.http.request(method, path, json=body)
        except httpx.HTTPError as e:
            logger.warning("Razorpay: %s %s failed.\nReason: %s", method, path, e)
            raise RazorpayError("Payments are unavailable right now. Try again.") from e
        data = res.json() if res.content else {}
        if res.is_error:
            reason = (data.get("error") or {}).get("description") or f"HTTP {res.status_code}"
            logger.warning("Razorpay: %s %s refused.\nReason: %s", method, path, reason)
            raise RazorpayError(reason)
        return data

    async def create_plan(self, tenure: str, amount_paise: int, name: str) -> str:
        period, interval = PERIODS[tenure]
        plan = await self.call("POST", "/plans", {
            "period": period,
            "interval": interval,
            "item": {"name": name, "amount": amount_paise, "currency": "INR"},
        })
        return plan["id"]

    async def create_subscription(
        self, plan_id: str, total_count: int, start_at: int, upfront_paise: int, notes: dict[str, str],
    ) -> dict[str, Any]:
        return await self.call("POST", "/subscriptions", {
            "plan_id": plan_id,
            "total_count": total_count,
            "quantity": 1,
            "customer_notify": 1,
            "start_at": start_at,
            "addons": [{"item": {"name": "First period", "amount": upfront_paise, "currency": "INR"}}],
            "notes": notes,
        })

    async def fetch_subscription(self, subscription_id: str) -> dict[str, Any]:
        return await self.call("GET", f"/subscriptions/{subscription_id}")

    async def cancel_subscription(self, subscription_id: str) -> dict[str, Any]:
        return await self.call("POST", f"/subscriptions/{subscription_id}/cancel", {"cancel_at_cycle_end": 0})

    async def fetch_payment(self, payment_id: str) -> dict[str, Any]:
        return await self.call("GET", f"/payments/{payment_id}")

    async def paid_invoices(self, subscription_id: str) -> list[dict[str, Any]]:
        data = await self.call("GET", f"/invoices?subscription_id={subscription_id}&count=100")
        return [i for i in data.get("items", []) if i.get("status") == "paid" and i.get("payment_id")]

    def checkout_signature_ok(self, payment_id: str, subscription_id: str, signature: str) -> bool:
        return signature_ok(self.key_secret, f"{payment_id}|{subscription_id}".encode(), signature)

    def webhook_signature_ok(self, body: bytes, signature: str) -> bool:
        return bool(self.webhook_secret) and signature_ok(self.webhook_secret, body, signature)


def get_razorpay(request: Request) -> RazorpayClient:
    return request.app.state.razorpay
