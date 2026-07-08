from __future__ import annotations

from app.api.endpoints.watchlist.constants import (
    PRE_DEFINED_TOKENS,
    PRE_DEFINED_WATCHLIST,
)


def is_predefined(name: str) -> bool:
    return name in PRE_DEFINED_WATCHLIST


def predefined_count(name: str) -> int:
    return len(PRE_DEFINED_TOKENS.get(name, []))
