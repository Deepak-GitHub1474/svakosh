from __future__ import annotations

import asyncio
from typing import Any

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.api.endpoints.auth.utils import AccessClaims
from app.api.endpoints.billing.access import require_broker_subscription
from app.api.endpoints.trade.models import (
    LinkAccountRequest,
    ModifyOrderRequest,
    PlaceOrderRequest,
    PlaceOrdersRequest,
    SessionRequest,
    Ticket,
    UpdateAccountRequest,
)
from app.config import get_settings
from app.trade_hub import TradeHubClient

HISTORY_LIMIT_MAX = 200
ADMIN_ONLY_BROKERS = frozenset({"paper", "zerodha", "groww"})


async def list_accounts(trade: TradeHubClient, claims: AccessClaims) -> Any:
    return await trade.call("trade.account.list", {"user_id": claims.user_id})


async def link_account(
    trade: TradeHubClient, claims: AccessClaims, body: LinkAccountRequest
) -> Any:
    if body.broker.lower() in ADMIN_ONLY_BROKERS and claims.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This broker is available to admins only.",
        )
    return await trade.call(
        "trade.account.link", {"user_id": claims.user_id, **body.model_dump()}
    )


async def update_account(
    trade: TradeHubClient,
    claims: AccessClaims,
    account_id: str,
    body: UpdateAccountRequest,
) -> Any:
    payload = {
        "user_id": claims.user_id,
        "account_id": account_id,
        **body.model_dump(exclude_unset=True),
    }
    return await trade.call("trade.account.update", payload)


def login_redirect_url() -> str:
    settings = get_settings()
    return (
        settings.TRADE_LOGIN_REDIRECT_URL
        or f"{settings.WEBAUTHN_ORIGIN.rstrip('/')}/broker/accounts/callback"
    )


async def login_url(
    trade: TradeHubClient, claims: AccessClaims, account_id: str
) -> Any:
    payload = {
        "user_id": claims.user_id,
        "account_id": account_id,
        "redirect_url": login_redirect_url(),
    }
    return await trade.call("trade.account.login_url", payload)


async def connect_session(
    trade: TradeHubClient, claims: AccessClaims, account_id: str, body: SessionRequest
) -> Any:
    payload = {
        "user_id": claims.user_id,
        "account_id": account_id,
        "params": body.params,
    }
    return await trade.call("trade.account.connect", payload)


async def unlink_account(
    trade: TradeHubClient, claims: AccessClaims, account_id: str
) -> Any:
    return await trade.call(
        "trade.account.unlink", {"user_id": claims.user_id, "account_id": account_id}
    )


async def portfolio(
    trade: TradeHubClient, claims: AccessClaims, kind: str, account_id: str
) -> Any:
    return await trade.call(
        f"trade.portfolio.{kind}", {"user_id": claims.user_id, "account_id": account_id}
    )


async def order_book(
    trade: TradeHubClient, claims: AccessClaims, account_id: str
) -> Any:
    return await trade.call(
        "trade.order.list", {"user_id": claims.user_id, "account_id": account_id}
    )


async def order_history(
    trade: TradeHubClient,
    claims: AccessClaims,
    account_id: str,
    before: str | None,
    limit: int,
) -> Any:
    payload: dict[str, Any] = {
        "user_id": claims.user_id,
        "account_id": account_id,
        "limit": limit,
    }
    if before:
        payload["before"] = before
    return await trade.call("trade.order.history", payload)


async def place_order(
    trade: TradeHubClient, claims: AccessClaims, body: PlaceOrderRequest
) -> Any:
    return await trade.call(
        "trade.order.place", {"user_id": claims.user_id, **body.model_dump()}
    )


async def place_orders(
    trade: TradeHubClient,
    mongo: AsyncIOMotorDatabase,
    redis: Redis,
    claims: AccessClaims,
    body: PlaceOrdersRequest,
) -> list[dict[str, Any]]:
    ticket = body.model_dump(exclude={"account_id", "account_ids", "client_order_id"})

    async def one(account_id: str) -> dict[str, Any]:
        try:
            await require_broker_subscription(mongo, redis, claims, account_id)
            data = await trade.call(
                "trade.order.place",
                {
                    "user_id": claims.user_id,
                    **ticket,
                    "account_id": account_id,
                    "client_order_id": f"{body.client_order_id}-{account_id[-6:]}",
                },
            )
            return {"account_id": account_id, "ok": True, "order": data}
        except HTTPException as e:
            detail = e.detail if isinstance(e.detail, dict) else {"message": str(e.detail)}
            return {"account_id": account_id, "ok": False, "status": e.status_code, **detail}

    return list(await asyncio.gather(*(one(a) for a in dict.fromkeys(body.account_ids))))


async def order_margin(
    trade: TradeHubClient, claims: AccessClaims, body: Ticket
) -> Any:
    return await trade.call(
        "trade.order.margin", {"user_id": claims.user_id, **body.model_dump()}
    )


async def modify_order(
    trade: TradeHubClient, claims: AccessClaims, order_id: str, body: ModifyOrderRequest
) -> Any:
    return await trade.call(
        "trade.order.modify",
        {"user_id": claims.user_id, "order_id": order_id, **body.model_dump()},
    )


async def cancel_order(
    trade: TradeHubClient,
    claims: AccessClaims,
    order_id: str,
    account_id: str,
    order_type: str,
    token: str = "",
) -> Any:
    payload = {
        "user_id": claims.user_id,
        "account_id": account_id,
        "order_id": order_id,
        "type": order_type,
        "token": token,
    }
    return await trade.call("trade.order.cancel", payload)
