from __future__ import annotations

import asyncio
import csv
import io
import logging
import re
import time
from typing import Any

import httpx

from app.api.endpoints.market.constants import COMPANY_NAMES

logger = logging.getLogger("svakosh.market")

NSE_EQUITY_URL = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"
REFRESH_SECONDS = 86400.0
RETRY_SECONDS = 600.0
FETCH_TIMEOUT_SECONDS = 10.0
LEGAL_SUFFIX = re.compile(r"\s+(Limited|Ltd\.?)$", re.IGNORECASE)
INDEX_NAMES = {
    token.split(":")[2]: name
    for token, name in COMPANY_NAMES.items()
    if ":IDX:" in token
}


class CompanyNames:
    def __init__(self) -> None:
        self.names: dict[str, str] = {}
        self.next_load = 0.0
        self.lock = asyncio.Lock()

    async def load(self) -> dict[str, str]:
        if time.monotonic() < self.next_load:
            return self.names
        async with self.lock:
            if time.monotonic() < self.next_load:
                return self.names
            try:
                async with httpx.AsyncClient(
                    timeout=FETCH_TIMEOUT_SECONDS, headers={"User-Agent": "Mozilla/5.0"}
                ) as client:
                    res = await client.get(NSE_EQUITY_URL)
                    res.raise_for_status()
                rows = csv.DictReader(io.StringIO(res.text))
                self.names = {
                    row["SYMBOL"].strip(): LEGAL_SUFFIX.sub(
                        "", row["NAME OF COMPANY"].strip()
                    )
                    for row in rows
                }
                self.next_load = time.monotonic() + REFRESH_SECONDS
            except (httpx.HTTPError, KeyError) as e:
                logger.warning(
                    "Company names: NSE list unavailable.\nReason: %s: %s",
                    type(e).__name__,
                    e,
                )
                self.next_load = time.monotonic() + RETRY_SECONDS
        return self.names

    async def of(self, instrument: dict[str, Any]) -> str | None:
        if instrument["token"] in COMPANY_NAMES:
            return COMPANY_NAMES[instrument["token"]]
        underlying = instrument["underlying"]
        if underlying in INDEX_NAMES:
            return INDEX_NAMES[underlying]
        return (await self.load()).get(underlying)


company_names = CompanyNames()
