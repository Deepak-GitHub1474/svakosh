from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Callable
from typing import Annotated, Any

import nats
from fastapi import Depends, HTTPException, Request, status
from nats.aio.client import Client
from nats.aio.msg import Msg
from nats.errors import Error as NatsError

logger = logging.getLogger("svakosh.trade_hub")

REQUEST_TIMEOUT_SECONDS = 35.0
RETRY_SECONDS = 10.0
LEASE_RENEW_SECONDS = 120.0

STATUS_BY_CODE = {
    "BAD_REQUEST": status.HTTP_400_BAD_REQUEST,
    "INVALID_ORDER": status.HTTP_400_BAD_REQUEST,
    "INVALID_REQUEST": status.HTTP_400_BAD_REQUEST,
    "INVALID_CREDENTIALS": status.HTTP_400_BAD_REQUEST,
    "NOT_FOUND": status.HTTP_404_NOT_FOUND,
    "INSTRUMENT_NOT_FOUND": status.HTTP_404_NOT_FOUND,
    "CONFLICT": status.HTTP_409_CONFLICT,
    "SESSION_EXPIRED": status.HTTP_409_CONFLICT,
    "BROKER_REJECTED": status.HTTP_422_UNPROCESSABLE_ENTITY,
    "TRADING_PAUSED": status.HTTP_423_LOCKED,
    "RATE_LIMITED": status.HTTP_429_TOO_MANY_REQUESTS,
    "BROKER_RATE_LIMITED": status.HTTP_429_TOO_MANY_REQUESTS,
    "BROKER_UNAVAILABLE": status.HTTP_503_SERVICE_UNAVAILABLE,
}


def unavailable(message: str, code: str = "BROKER_UNAVAILABLE") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={"message": message, "code": code},
    )


class TradeHubClient:
    def __init__(self, url: str) -> None:
        self.url = url
        self.nc: Client | None = None
        self.task: asyncio.Task[None] | None = None

    @property
    def connected(self) -> bool:
        return self.nc is not None and self.nc.is_connected

    def start(self) -> None:
        if self.url:
            self.task = asyncio.create_task(self.connect_with_retry())

    async def stop(self) -> None:
        if self.task is not None:
            self.task.cancel()
        if self.nc is not None and not self.nc.is_closed:
            await self.nc.drain()

    async def connect_with_retry(self) -> None:
        while True:
            try:
                self.nc = await nats.connect(
                    self.url, name="svakosh-trade", max_reconnect_attempts=-1
                )
                logger.info("Trade hub: connected.")
                return
            except (NatsError, OSError, TimeoutError) as e:
                logger.warning(
                    "Trade hub: connection failed, retrying in %ss.\nReason: %s: %s",
                    RETRY_SECONDS,
                    type(e).__name__,
                    e,
                )
                await asyncio.sleep(RETRY_SECONDS)

    async def call(self, subject: str, payload: dict[str, Any]) -> Any:
        if self.nc is None or not self.connected:
            raise unavailable("Trading is not available right now.")
        try:
            msg = await self.nc.request(
                subject, json.dumps(payload).encode(), timeout=REQUEST_TIMEOUT_SECONDS
            )
        except TimeoutError as e:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail={
                    "message": "The broker did not answer in time. Check your orders before retrying.",
                    "code": "TIMEOUT",
                },
            ) from e
        except NatsError as e:
            raise unavailable("Trading is not available right now.") from e
        body = json.loads(msg.data)
        if body.get("success"):
            return body.get("data")
        data = body.get("data") if isinstance(body.get("data"), dict) else {}
        code = data.get("code", "INTERNAL")
        raise HTTPException(
            status_code=STATUS_BY_CODE.get(code, status.HTTP_502_BAD_GATEWAY),
            detail={
                **data,
                "message": body.get("message") or "Trading request failed.",
                "code": code,
            },
        )

    async def follow_orders(
        self, user_id: str, on_update: Callable[[dict[str, Any]], None]
    ) -> None:
        if self.nc is None or not self.connected:
            return

        async def forward(msg: Msg) -> None:
            on_update(json.loads(msg.data))

        sub = await self.nc.subscribe(f"trade.update.{user_id}", cb=forward)
        try:
            while True:
                try:
                    await self.call("trade.stream.lease", {"user_id": user_id})
                except HTTPException as e:
                    logger.warning(
                        "Trade hub: order stream lease failed.\nReason: %s", e.detail
                    )
                await asyncio.sleep(LEASE_RENEW_SECONDS)
        finally:
            await sub.unsubscribe()


def get_trade_hub(request: Request) -> TradeHubClient:
    return request.app.state.trade_hub


TradeHub = Annotated[TradeHubClient, Depends(get_trade_hub)]
