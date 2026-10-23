from __future__ import annotations

import asyncio
import json
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from app.api.endpoints.market.constants import (
    DEFAULT_FIELDS,
    FEED_FIELDS,
    MAX_DEPTH_PER_SOCKET,
    MAX_TOKENS_PER_SOCKET,
    SEND_QUEUE_LIMIT,
)
from app.api.endpoints.market.utils import is_feed_token
from app.market_data import MarketDataClient
from app.trade_hub import TradeHubClient


class SlowClientError(Exception):
    pass


def pick(quote: dict[str, Any], fields: set[str]) -> dict[str, Any]:
    return {k: quote[k] for k in fields if k in quote}


async def stream_market(
    ws: WebSocket, market: MarketDataClient, trade: TradeHubClient, user_id: str
) -> None:
    tokens: dict[str, set[str]] = {}
    depth: set[str] = set()
    outbox: asyncio.Queue[str] = asyncio.Queue(maxsize=SEND_QUEUE_LIMIT)
    too_slow = asyncio.Event()
    orders: list[asyncio.Task[None]] = []

    def on_order(update: dict[str, Any]) -> None:
        try:
            outbox.put_nowait(json.dumps({"type": "order", "data": update}))
        except asyncio.QueueFull:
            too_slow.set()

    def follow(on: bool) -> None:
        if on and not orders:
            orders.append(asyncio.create_task(trade.follow_orders(user_id, on_order)))
        elif not on and orders:
            orders.pop().cancel()

    def on_tick(tick: dict[str, Any]) -> None:
        fields = tokens.get(tick["token"])
        if not fields:
            return
        changed = pick(tick, fields)
        if not changed:
            return
        try:
            outbox.put_nowait(json.dumps({"type": "tick", "data": {"sk_token": tick["token"], **changed}}))
        except asyncio.QueueFull:
            too_slow.set()

    def on_depth(book: dict[str, Any]) -> None:
        if book.get("token") not in depth:
            return
        try:
            outbox.put_nowait(json.dumps({"type": "depth", "data": book}))
        except asyncio.QueueFull:
            too_slow.set()

    async def watch_depth(requested: list[Any]) -> None:
        wanted = {t for t in requested if is_feed_token(t)}
        if len(wanted) > MAX_DEPTH_PER_SOCKET:
            await outbox.put(json.dumps({"type": "error", "message": f"At most {MAX_DEPTH_PER_SOCKET} depth tokens per socket."}))
            return
        market.unwant_depth(depth - wanted)
        await market.want_depth(wanted - depth)
        depth.clear()
        depth.update(wanted)

    market.listeners.add(on_tick)
    market.depth_listeners.add(on_depth)
    try:
        async with asyncio.TaskGroup() as group:
            group.create_task(receive(ws, market, tokens, outbox, follow, watch_depth))
            group.create_task(send(ws, outbox, too_slow))
    except* (WebSocketDisconnect, SlowClientError):
        pass
    finally:
        follow(False)
        market.listeners.discard(on_tick)
        market.depth_listeners.discard(on_depth)
        market.unwant_depth(depth)
        market.unwant(tokens)


async def receive(
    ws: WebSocket,
    market: MarketDataClient,
    tokens: dict[str, set[str]],
    outbox: asyncio.Queue[str],
    follow: Callable[[bool], None],
    watch_depth: Callable[[list[Any]], Awaitable[None]],
) -> None:
    while True:
        message: dict[str, Any] = await ws.receive_json()
        event, requested, fields = message.get("event"), message.get("tokens"), message.get("fields")
        if event == "orders":
            follow(message.get("on") is True)
            continue
        if event == "depth":
            await watch_depth(requested if isinstance(requested, list) else [])
            continue
        if event not in ("subscribe", "unsubscribe") or not isinstance(requested, list):
            await outbox.put(json.dumps({"type": "error", "message": "Send {event: subscribe|unsubscribe, tokens: [...], fields?: [...]}."}))
            continue
        wanted = {t for t in requested if is_feed_token(t)}
        chosen = {f for f in fields if f in FEED_FIELDS} if isinstance(fields, list) else set(DEFAULT_FIELDS)
        if event == "unsubscribe":
            gone = []
            for t in wanted & tokens.keys():
                tokens[t] -= chosen
                if not tokens[t] or not isinstance(fields, list):
                    del tokens[t]
                    gone.append(t)
            market.unwant(gone)
            continue
        fresh = wanted - tokens.keys()
        if len(tokens) + len(fresh) > MAX_TOKENS_PER_SOCKET:
            await outbox.put(json.dumps({"type": "error", "message": f"At most {MAX_TOKENS_PER_SOCKET} tokens per socket."}))
            continue
        for t in wanted:
            tokens.setdefault(t, set()).update(chosen)
        await market.want(fresh)
        snapshot = [
            {"sk_token": t, **pick(market.quotes[t], chosen)}
            for t in wanted
            if pick(market.quotes.get(t, {}), chosen)
        ]
        await outbox.put(json.dumps({"type": "snapshot", "data": snapshot}))


async def send(ws: WebSocket, outbox: asyncio.Queue[str], too_slow: asyncio.Event) -> None:
    while True:
        message = await outbox.get()
        if too_slow.is_set():
            await ws.close(code=1013, reason="Too slow, reconnect for a fresh snapshot.")
            raise SlowClientError
        await ws.send_text(message)
