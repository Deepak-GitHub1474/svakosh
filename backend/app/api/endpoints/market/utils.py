from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from typing import Any

from app.api.endpoints.market.constants import SUBJECT_UNSAFE_CHARS

IST = timezone(timedelta(hours=5, minutes=30), "IST")


def is_feed_token(token: Any) -> bool:
    if not isinstance(token, str):
        return False
    parts = token.split(":")
    return len(parts) >= 3 and SUBJECT_UNSAFE_CHARS.isdisjoint(parts[0] + parts[2])


def session_status(now: datetime, live: bool, pre_open: time | None, opens: time, closes: time) -> str:
    if now.weekday() >= 5 or not live:
        return "Closed"
    current = now.time()
    if pre_open is not None and pre_open <= current < opens:
        return "Pre-open"
    if opens <= current < closes:
        return "Open"
    return "Closed"


INSTRUMENT_TYPES = {"IDX": "INDEX", "EQ": "EQUITY", "FUT": "FUTURE", "OPT": "OPTION"}


def display_name(instrument: dict[str, Any]) -> str:
    underlying, kind = instrument["underlying"], instrument["kind"]
    if kind not in ("FUT", "OPT"):
        return underlying
    expiry = date.fromisoformat(instrument["expiry"]).strftime("%d %b").upper()
    if kind == "FUT":
        return f"{underlying} {expiry} FUT"
    return f"{underlying} {expiry} {instrument['strike']:g} {instrument['option_type']}"


def symbol_of(instrument: dict[str, Any]) -> dict[str, Any]:
    return {
        "sk_token": instrument["token"],
        "trading_symbol": display_name(instrument),
        "exchange": instrument["exchange"],
        "instrument": INSTRUMENT_TYPES.get(instrument["kind"], instrument["kind"]),
        "lot_size": instrument.get("lot_size", 0),
        "expiry": instrument.get("expiry"),
        "strike": instrument.get("strike"),
        "option_type": instrument.get("option_type"),
        "underlying_symbol": instrument["underlying"],
    }
