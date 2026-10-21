from __future__ import annotations

from datetime import datetime, time, timedelta
from typing import Any

from fastapi import HTTPException, status

from app.api.endpoints.market.constants import (
    COMPANY_NAMES,
    EQUITY_PREFIX,
    FII_DII_DAYS,
    INDICES,
    INTRADAY_LOOKBACK_DAYS,
    SEARCH_LIMIT,
    STALE_AFTER_SECONDS,
)
from app.api.endpoints.market.utils import IST, session_status, symbol_of
from app.market_data import MarketDataClient, MarketDataError


async def market_overview(market: MarketDataClient) -> dict[str, Any]:
    if not market.connected or not market.quotes:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Market data is not available right now.",
        )
    now = datetime.now(IST)
    quotes = market.quotes
    latest_ts = max((q.get("ts", 0) for q in quotes.values()), default=0)
    live = (now.timestamp() * 1000 - latest_ts) <= STALE_AFTER_SECONDS * 1000

    return {
        "status": {
            "nse_equity": session_status(now, live, time(9, 0), time(9, 15), time(15, 30)),
            "nse_fo": session_status(now, live, None, time(9, 15), time(15, 40)),
            "nse_currency": session_status(now, live, None, time(9, 0), time(17, 0)),
            "as_of": now.isoformat(),
        },
        "indices": [
            {"sk_token": token, "symbol": symbol, "display_name": name}
            for token, symbol, name in INDICES
            if token in quotes
        ],
        "stocks": [
            {
                "sk_token": token,
                "symbol": token.removeprefix(EQUITY_PREFIX),
                "name": COMPANY_NAMES.get(token, token.removeprefix(EQUITY_PREFIX)),
            }
            for token, q in sorted(quotes.items())
            if token.startswith(EQUITY_PREFIX) and q.get("prev_close")
        ],
        "fii_dii": fii_dii_rows(await market.fii_dii_history()),
    }


def fii_dii_rows(history: list[list[dict[str, Any]]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for day in history[:FII_DII_DAYS]:
        by_category = {r["category"]: r for r in day}
        fii, dii = by_category.get("FII"), by_category.get("DII")
        if fii is None or dii is None:
            continue
        rows.append(
            {
                "date": fii["date"],
                "fii_buy_value": fii["buy"],
                "fii_sell_value": fii["sell"],
                "fii_net": fii["net"],
                "dii_buy_value": dii["buy"],
                "dii_sell_value": dii["sell"],
                "dii_net": dii["net"],
            }
        )
    return rows


async def search_symbols(market: MarketDataClient, query: str) -> list[dict[str, Any]]:
    try:
        found = await market.search(query, SEARCH_LIMIT)
    except MarketDataError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)) from e
    return [symbol_of(i) for i in found]


async def intraday(market: MarketDataClient, token: str, interval: str) -> list[dict[str, Any]]:
    now = datetime.now(IST)
    start = (now - timedelta(days=INTRADAY_LOOKBACK_DAYS)).strftime("%Y-%m-%d")
    try:
        candles = await market.history(token, interval, start, now.strftime("%Y-%m-%d %H:%M"))
    except MarketDataError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)) from e
    if not candles:
        return []
    last_day = datetime.fromtimestamp(candles[-1]["ts"] / 1000, IST).date()
    return [c for c in candles if datetime.fromtimestamp(c["ts"] / 1000, IST).date() == last_day]


async def _ask(call: Any) -> Any:
    try:
        return await call
    except MarketDataError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)) from e


async def option_chains(market: MarketDataClient) -> list[dict[str, Any]]:
    return await _ask(market.chains())


async def option_chain(market: MarketDataClient, exchange: str, underlying: str) -> dict[str, Any]:
    return await _ask(market.chain(exchange, underlying))


async def bars(market: MarketDataClient, subject: str, prefix: str, interval: int, minutes: int) -> dict[str, Any]:
    return await _ask(market.bars(subject, prefix, interval, minutes))
