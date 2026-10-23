from __future__ import annotations

import asyncio
import json
import logging
import time
from collections.abc import Callable, Iterable
from typing import Annotated, Any

import nats
from fastapi import Depends, Request
from nats.aio.client import Client
from nats.aio.msg import Msg
from nats.errors import Error as NatsError

logger = logging.getLogger("svakosh.market_data")

BASE_SUBJECTS = ("md.NSE.>", "md.BSE.>")
REQUEST_TIMEOUT_SECONDS = 5.0
BARS_TIMEOUT_SECONDS = 15.0
RETRY_SECONDS = 10.0
LEASE_RENEW_SECONDS = 60.0
LEASE_BATCH = 500
FII_DII_CACHE_SECONDS = 300.0
INSTRUMENT_CACHE_MAX = 20_000
HISTORY_CACHE_SECONDS = 60.0
AVG_VOLUME_CACHE_SECONDS = 1800.0


class MarketDataError(Exception):
    pass


def subject_of(token: str) -> str:
    parts = token.split(":")
    return f"md.{parts[0]}.{parts[2]}" if len(parts) >= 3 else ""


class MarketDataClient:
    def __init__(self, url: str) -> None:
        self.url = url
        self.nc: Client | None = None
        self.quotes: dict[str, dict[str, Any]] = {}
        self.tasks: list[asyncio.Task[None]] = []
        self.listeners: set[Callable[[dict[str, Any]], None]] = set()
        self.depth_listeners: set[Callable[[dict[str, Any]], None]] = set()
        self.wanted: dict[str, int] = {}
        self.depth_wanted: dict[str, int] = {}
        self.subjects: set[str] = set()
        self.fii_dii_cache: tuple[float, list[list[dict[str, Any]]]] = (0.0, [])
        self.instrument_cache: dict[str, dict[str, Any]] = {}
        self.history_cache: dict[tuple[str, ...], tuple[float, list[dict[str, Any]]]] = {}
        self.avg_volume_cache: tuple[float, dict[str, int]] = (0.0, {})

    @property
    def connected(self) -> bool:
        return self.nc is not None and self.nc.is_connected

    def start(self) -> None:
        self.tasks = [
            asyncio.create_task(self.connect_with_retry()),
            asyncio.create_task(self.renew_leases()),
        ]

    async def stop(self) -> None:
        for task in self.tasks:
            task.cancel()
        if self.nc is not None and not self.nc.is_closed:
            await self.nc.drain()

    async def connect_with_retry(self) -> None:
        while True:
            try:
                self.nc = await nats.connect(
                    self.url,
                    name="svakosh-api",
                    max_reconnect_attempts=-1,
                    reconnected_cb=self.on_reconnect,
                )
                for subject in BASE_SUBJECTS:
                    await self.nc.subscribe(subject, cb=self.on_tick)
                    await self.load_snapshot(subject)
                await self.nc.subscribe("depth.>", cb=self.on_depth)
                logger.info("Market data: connected, %d symbols loaded.", len(self.quotes))
                return
            except Exception as e:
                logger.warning(
                    "Market data: connection failed, retrying in %ss.\nReason: %s: %s",
                    RETRY_SECONDS,
                    type(e).__name__,
                    e,
                )
                await asyncio.sleep(RETRY_SECONDS)

    async def on_reconnect(self) -> None:
        for subject in (*BASE_SUBJECTS, *self.subjects):
            await self.load_snapshot(subject)
        await self.lease(list(self.wanted))
        await self.lease(list(self.depth_wanted), "ctl.depth")

    async def load_snapshot(self, subject: str) -> None:
        if self.nc is None:
            return
        msg = await self.nc.request(
            "snap." + subject.removeprefix("md."), b"", timeout=REQUEST_TIMEOUT_SECONDS
        )
        body = json.loads(msg.data)
        if not body.get("ok"):
            logger.warning("Market data: snapshot %s refused: %s", subject, body.get("error"))
            return
        for quote in body["data"]:
            newer = self.quotes.get(quote["token"], {})
            self.quotes[quote["token"]] = {**quote, **newer}

    async def on_tick(self, msg: Msg) -> None:
        tick = json.loads(msg.data)
        self.quotes.setdefault(tick["token"], {}).update(tick)
        for notify in self.listeners:
            notify(tick)

    async def on_depth(self, msg: Msg) -> None:
        book = json.loads(msg.data)
        for notify in self.depth_listeners:
            notify(book)

    async def want_depth(self, tokens: Iterable[str]) -> None:
        fresh = []
        for token in tokens:
            self.depth_wanted[token] = self.depth_wanted.get(token, 0) + 1
            if self.depth_wanted[token] == 1:
                fresh.append(token)
        await self.lease(fresh, "ctl.depth")

    def unwant_depth(self, tokens: Iterable[str]) -> None:
        for token in tokens:
            left = self.depth_wanted.get(token, 0) - 1
            if left > 0:
                self.depth_wanted[token] = left
            else:
                self.depth_wanted.pop(token, None)

    async def want(self, tokens: Iterable[str]) -> None:
        fresh = []
        for token in tokens:
            self.wanted[token] = self.wanted.get(token, 0) + 1
            if self.wanted[token] == 1:
                fresh.append(token)
        if not fresh or self.nc is None:
            return
        for subject in {subject_of(t) for t in fresh} - self.subjects:
            if subject and not subject.startswith(("md.NSE.", "md.BSE.")):
                self.subjects.add(subject)
                await self.nc.subscribe(subject, cb=self.on_tick)
                await self.load_snapshot(subject)
        await self.lease(fresh)

    def unwant(self, tokens: Iterable[str]) -> None:
        for token in tokens:
            left = self.wanted.get(token, 0) - 1
            if left > 0:
                self.wanted[token] = left
            else:
                self.wanted.pop(token, None)

    async def lease(self, tokens: list[str], subject: str = "ctl.subscribe") -> None:
        if self.nc is None or not tokens:
            return
        for i in range(0, len(tokens), LEASE_BATCH):
            batch = tokens[i : i + LEASE_BATCH]
            try:
                await self.nc.request(
                    subject,
                    json.dumps({"tokens": batch}).encode(),
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
            except NatsError as e:
                logger.warning("Market data: lease of %d tokens failed.\nReason: %s", len(batch), e)

    async def renew_leases(self) -> None:
        while True:
            await asyncio.sleep(LEASE_RENEW_SECONDS)
            await self.lease(list(self.wanted))
            await self.lease(list(self.depth_wanted), "ctl.depth")

    async def ask(self, subject: str, payload: dict[str, Any], timeout: float = REQUEST_TIMEOUT_SECONDS) -> Any:
        if self.nc is None or not self.nc.is_connected:
            raise MarketDataError("Market data is not available right now.")
        try:
            msg = await self.nc.request(subject, json.dumps(payload).encode(), timeout=timeout)
        except NatsError as e:
            raise MarketDataError("Market data did not answer in time.") from e
        body = json.loads(msg.data)
        if not body.get("ok"):
            raise MarketDataError(body.get("error", {}).get("message", "Market data request failed."))
        return body["data"]

    async def instruments(self, tokens: list[str]) -> dict[str, dict[str, Any]]:
        missing = [t for t in dict.fromkeys(tokens) if t not in self.instrument_cache]
        for i in range(0, len(missing), LEASE_BATCH):
            found = await self.ask("ref.instruments", {"tokens": missing[i : i + LEASE_BATCH]})
            if len(self.instrument_cache) + len(found) > INSTRUMENT_CACHE_MAX:
                self.instrument_cache.clear()
            self.instrument_cache.update({item["token"]: item for item in found})
        return {t: self.instrument_cache[t] for t in tokens if t in self.instrument_cache}

    async def history(self, token: str, interval: str, start: str, end: str) -> list[dict[str, Any]]:
        key = (token, interval)
        fetched_at, cached = self.history_cache.get(key, (0.0, []))
        if time.monotonic() - fetched_at < HISTORY_CACHE_SECONDS:
            return cached
        candles = await self.ask("ref.history", {"token": token, "interval": interval, "from": start, "to": end})
        self.history_cache = {k: v for k, v in self.history_cache.items() if time.monotonic() - v[0] < HISTORY_CACHE_SECONDS}
        self.history_cache[key] = (time.monotonic(), candles)
        return candles

    async def bars(self, subject: str, prefix: str, interval: int, minutes: int) -> dict[str, list[list[float]]]:
        return await self.ask(
            "ref.bars",
            {"subject": subject, "prefix": prefix, "interval": interval, "minutes": minutes},
            BARS_TIMEOUT_SECONDS,
        )

    async def chains(self) -> list[dict[str, Any]]:
        return await self.ask("ref.chains", {})

    async def chain(self, exchange: str, underlying: str) -> dict[str, Any]:
        return await self.ask("ref.chain", {"exchange": exchange, "underlying": underlying})

    async def search(self, query: str, limit: int) -> list[dict[str, Any]]:
        return await self.ask("ref.search", {"q": query, "limit": limit})

    async def avg_volumes(self) -> dict[str, int]:
        fetched_at, cached = self.avg_volume_cache
        if self.nc is None or (cached and time.monotonic() - fetched_at < AVG_VOLUME_CACHE_SECONDS):
            return cached
        try:
            kv = await self.nc.jetstream().key_value("meta")
            entry = await kv.get("avg_volume")
        except NatsError as e:
            logger.warning("Market data: average volume unavailable, using cached.\nReason: %s", e)
            return cached
        volumes = json.loads(entry.value or b"{}").get("volumes", {})
        self.avg_volume_cache = (time.monotonic(), volumes)
        return volumes

    async def fii_dii_history(self) -> list[list[dict[str, Any]]]:
        fetched_at, cached = self.fii_dii_cache
        if self.nc is None or time.monotonic() - fetched_at < FII_DII_CACHE_SECONDS:
            return cached
        try:
            kv = await self.nc.jetstream().key_value("meta")
            entries = await kv.history("fii_dii")
        except NatsError as e:
            logger.warning("Market data: FII/DII history unavailable, using cached.\nReason: %s", e)
            return cached
        history = [json.loads(e.value) for e in reversed(entries) if e.value]
        self.fii_dii_cache = (time.monotonic(), history)
        return history


def get_market_data(request: Request) -> MarketDataClient:
    return request.app.state.market_data


MarketData = Annotated[MarketDataClient, Depends(get_market_data)]
