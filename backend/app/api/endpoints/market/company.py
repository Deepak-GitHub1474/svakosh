from __future__ import annotations

import asyncio
import csv
import io
import logging
import re
from typing import Any

import httpx

from app.api.endpoints.market.constants import COMPANY_NAMES

logger = logging.getLogger("svakosh.market")

NSE_EQUITY_URL = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"
REFRESH_SECONDS = 86400.0
RETRY_SECONDS = 600.0
FETCH_TIMEOUT_SECONDS = 10.0
MAX_LIST_BYTES = 2 * 1024 * 1024
LEGAL_SUFFIX = re.compile(r"\s+(Limited|Ltd\.?)$", re.IGNORECASE)
INDEX_NAMES = {
    token.split(":")[2]: name
    for token, name in COMPANY_NAMES.items()
    if ":IDX:" in token
}


class CompanyNames:
    def __init__(self) -> None:
        self.names: dict[str, str] = {}
        self.task: asyncio.Task[None] | None = None

    def start(self) -> None:
        self.task = asyncio.create_task(self.keep_fresh())

    def stop(self) -> None:
        if self.task is not None:
            self.task.cancel()

    async def keep_fresh(self) -> None:
        while True:
            loaded = await self.load()
            await asyncio.sleep(REFRESH_SECONDS if loaded else RETRY_SECONDS)

    async def load(self) -> bool:
        try:
            body = bytearray()
            async with (
                httpx.AsyncClient(
                    timeout=FETCH_TIMEOUT_SECONDS, headers={"User-Agent": "Mozilla/5.0"}
                ) as client,
                client.stream("GET", NSE_EQUITY_URL) as res,
            ):
                res.raise_for_status()
                async for chunk in res.aiter_bytes():
                    body.extend(chunk)
                    if len(body) > MAX_LIST_BYTES:
                        raise ValueError(f"NSE list is over {MAX_LIST_BYTES} bytes")
            rows = csv.DictReader(io.StringIO(body.decode("utf-8", "replace")))
            self.names = {
                row["SYMBOL"].strip(): LEGAL_SUFFIX.sub(
                    "", row["NAME OF COMPANY"].strip()
                )
                for row in rows
            }
            return True
        except (httpx.HTTPError, KeyError, ValueError) as e:
            logger.warning(
                "Company names: NSE list unavailable.\nReason: %s: %s",
                type(e).__name__,
                e,
            )
            return False

    def of(self, instrument: dict[str, Any]) -> str | None:
        if instrument["token"] in COMPANY_NAMES:
            return COMPANY_NAMES[instrument["token"]]
        underlying = instrument["underlying"]
        return INDEX_NAMES.get(underlying) or self.names.get(underlying)


company_names = CompanyNames()
