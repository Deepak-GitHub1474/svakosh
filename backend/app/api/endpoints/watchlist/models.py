from __future__ import annotations

from typing import Annotated, Any

from pydantic import BaseModel, BeforeValidator, Field


def _strip(v: Any) -> Any:
    return v.strip() if isinstance(v, str) else v


TrimStr = Annotated[str, BeforeValidator(_strip)]


class WatchlistSummary(BaseModel):
    name: str = Field(..., min_length=1, max_length=64)
    predefined: bool
    count: int = Field(..., ge=0)


class CreateWatchlistRequest(BaseModel):
    name: TrimStr = Field(..., min_length=1, max_length=64)


class AddSymbolRequest(BaseModel):
    watchlist_name: TrimStr = Field(..., min_length=1, max_length=64)
    sk_token: TrimStr = Field(..., min_length=1, max_length=128)


class RemoveSymbolRequest(BaseModel):
    watchlist_name: TrimStr = Field(..., min_length=1, max_length=64)
    sk_token: TrimStr = Field(..., min_length=1, max_length=128)


class UpsertNoteRequest(BaseModel):
    watchlist_name: TrimStr = Field(..., min_length=1, max_length=64)
    sk_token: TrimStr = Field(..., min_length=1, max_length=128)
    note: TrimStr = Field(..., min_length=1, max_length=500)


class DeleteNoteRequest(BaseModel):
    watchlist_name: TrimStr = Field(..., min_length=1, max_length=64)
    sk_token: TrimStr = Field(..., min_length=1, max_length=128)


class RenameWatchlistRequest(BaseModel):
    old_name: TrimStr = Field(..., min_length=1, max_length=64)
    new_name: TrimStr = Field(..., min_length=1, max_length=64)


class DeleteWatchlistRequest(BaseModel):
    name: TrimStr = Field(..., min_length=1, max_length=64)
