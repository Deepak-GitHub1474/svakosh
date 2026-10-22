from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.api.endpoints.auth.utils import AccessClaims
from app.api.endpoints.market.company import company_names
from app.api.endpoints.market.utils import symbol_of
from app.api.endpoints.watchlist.constants import (
    COL_WATCHLIST,
    COL_WATCHLIST_NOTES,
    MAX_CUSTOM_WATCHLISTS_PER_USER,
    MAX_SYMBOLS_PER_WATCHLIST,
    PRE_DEFINED_TOKEN_INDEX,
    PRE_DEFINED_TOKENS,
    PRE_DEFINED_WATCHLIST,
)
from app.api.endpoints.watchlist.utils import is_predefined, predefined_count
from app.market_data import MarketDataClient, MarketDataError
from app.utils.utils import now_utc

logger = logging.getLogger("svakosh.watchlist.controller")


async def list_user_watchlists(
    claims: AccessClaims, mongo: AsyncIOMotorDatabase,
) -> list[dict[str, Any]]:
    user_id = claims.user_id

    cur = mongo[COL_WATCHLIST].find(
        {"user_id": user_id},
        projection={"name": 1, "sk_tokens": 1},
    ).sort("name", 1)
    custom_docs = await cur.to_list(length=MAX_CUSTOM_WATCHLISTS_PER_USER)

    custom_items: list[dict[str, Any]] = [
        {
            "name": d["name"],
            "predefined": False,
            "count": len(d.get("sk_tokens") or []),
        }
        for d in custom_docs
    ]

    predef_items = [
        {"name": n, "predefined": True, "count": predefined_count(n)}
        for n in PRE_DEFINED_WATCHLIST
    ]
    return custom_items + predef_items


async def create_watchlist(
    claims: AccessClaims, mongo: AsyncIOMotorDatabase, name: str,
) -> dict[str, Any]:
    if is_predefined(name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot use a predefined watchlist name.",
        )

    col = mongo[COL_WATCHLIST]
    user_id = claims.user_id

    existing_count = await col.count_documents({"user_id": user_id})
    if existing_count >= MAX_CUSTOM_WATCHLISTS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Max {MAX_CUSTOM_WATCHLISTS_PER_USER} watchlists per user.",
        )

    duplicate = await col.find_one(
        {"user_id": user_id, "name": name},
        projection={"_id": 1},
    )
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Watchlist name already exists.",
        )

    now = now_utc()
    doc = {
        "user_id": user_id,
        "name": name,
        "is_predefined": False,
        "sk_tokens": [],
        "created_at": now,
        "updated_at": now,
    }
    try:
        await col.insert_one(doc)
    except DuplicateKeyError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Watchlist name already exists.",
        ) from e

    return {"name": name, "predefined": False, "count": 0}


async def add_symbol_to_watchlist(
    claims: AccessClaims,
    mongo: AsyncIOMotorDatabase,
    market: MarketDataClient,
    watchlist_name: str,
    sk_token: str,
) -> dict[str, Any]:
    if is_predefined(watchlist_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add symbols to a predefined watchlist.",
        )
    if sk_token not in await _instruments(market, [sk_token]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown symbol.",
        )

    col = mongo[COL_WATCHLIST]
    now = now_utc()
    entry = {"sk_token": sk_token, "note": None, "added_at": now}

    res = await col.update_one(
        {
            "user_id": claims.user_id,
            "name": watchlist_name,
            "sk_tokens.sk_token": {"$ne": sk_token},
            "$expr": {"$lt": [{"$size": {"$ifNull": ["$sk_tokens", []]}}, MAX_SYMBOLS_PER_WATCHLIST]},
        },
        {"$push": {"sk_tokens": entry}, "$set": {"updated_at": now}},
    )

    if res.modified_count == 1:
        doc = await col.find_one(
            {"user_id": claims.user_id, "name": watchlist_name},
            projection={"sk_tokens.sk_token": 1},
        )
        count = len((doc or {}).get("sk_tokens") or [])
        return {"watchlist_name": watchlist_name, "sk_token": sk_token, "count": count}

    existing = await col.find_one(
        {"user_id": claims.user_id, "name": watchlist_name},
        projection={"sk_tokens.sk_token": 1},
    )
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist not found.")
    tokens = [t["sk_token"] for t in (existing.get("sk_tokens") or [])]
    if sk_token in tokens:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Symbol already in watchlist.")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Max {MAX_SYMBOLS_PER_WATCHLIST} symbols per watchlist.",
    )


async def rename_watchlist(
    claims: AccessClaims,
    mongo: AsyncIOMotorDatabase,
    old_name: str,
    new_name: str,
) -> dict[str, Any]:
    if is_predefined(old_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot rename a predefined watchlist.",
        )
    if is_predefined(new_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target name conflicts with a predefined watchlist.",
        )
    if old_name == new_name:
        return {"old_name": old_name, "new_name": new_name}

    col = mongo[COL_WATCHLIST]
    user_id = claims.user_id

    clash = await col.find_one(
        {"user_id": user_id, "name": new_name},
        projection={"_id": 1},
    )
    if clash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Watchlist name already exists.",
        )

    try:
        res = await col.update_one(
            {"user_id": user_id, "name": old_name},
            {"$set": {"name": new_name, "updated_at": now_utc()}},
        )
    except DuplicateKeyError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Watchlist name already exists.",
        ) from e

    if res.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found.",
        )

    return {"old_name": old_name, "new_name": new_name}


async def delete_watchlist(
    claims: AccessClaims,
    mongo: AsyncIOMotorDatabase,
    name: str,
) -> dict[str, Any]:
    if is_predefined(name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a predefined watchlist.",
        )

    col = mongo[COL_WATCHLIST]
    res = await col.delete_one({"user_id": claims.user_id, "name": name})
    if res.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found.",
        )
    return {"name": name}


async def _instruments(market: MarketDataClient, tokens: list[str]) -> dict[str, dict[str, Any]]:
    try:
        return await market.instruments(tokens)
    except MarketDataError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)) from e


async def _entries(
    market: MarketDataClient, tokens: list[str], notes: dict[str, str | None],
) -> list[dict[str, Any]]:
    found = await _instruments(market, tokens)
    return [
        {
            **symbol_of(found[t]),
            "company_name": company_names.of(found[t]),
            "symbol_note": notes.get(t),
        }
        for t in tokens
        if t in found
    ]


async def _notes_map(
    mongo: AsyncIOMotorDatabase, user_id: str, watchlist_name: str,
) -> dict[str, str]:
    cur = mongo[COL_WATCHLIST_NOTES].find(
        {"user_id": user_id, "watchlist_name": watchlist_name},
        projection={"sk_token": 1, "note": 1},
    )
    return {d["sk_token"]: d.get("note", "") for d in await cur.to_list(length=500)}


async def get_watchlist_entries(
    claims: AccessClaims, mongo: AsyncIOMotorDatabase, market: MarketDataClient, name: str,
) -> dict[str, Any]:
    if is_predefined(name):
        notes = await _notes_map(mongo, claims.user_id, name)
        entries = await _entries(market, PRE_DEFINED_TOKENS.get(name, []), dict(notes))
        return {"watchlist": name, "predefined": True, "entries": entries}

    doc = await mongo[COL_WATCHLIST].find_one(
        {"user_id": claims.user_id, "name": name},
        projection={"sk_tokens": 1},
    )
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found.",
        )

    saved = doc.get("sk_tokens") or []
    notes = {t["sk_token"]: t.get("note") for t in saved}
    entries = await _entries(market, [t["sk_token"] for t in saved], notes)
    return {"watchlist": name, "predefined": False, "entries": entries}


async def _validate_symbol_in_watchlist(
    mongo: AsyncIOMotorDatabase, user_id: str, watchlist_name: str, sk_token: str,
) -> None:
    if is_predefined(watchlist_name):
        if sk_token not in PRE_DEFINED_TOKEN_INDEX.get(watchlist_name, set()):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symbol not in watchlist.")
        return
    doc = await mongo[COL_WATCHLIST].find_one(
        {"user_id": user_id, "name": watchlist_name, "sk_tokens.sk_token": sk_token},
        projection={"_id": 1},
    )
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symbol not in watchlist.")


async def upsert_symbol_note(
    claims: AccessClaims,
    mongo: AsyncIOMotorDatabase,
    watchlist_name: str,
    sk_token: str,
    note: str,
) -> dict[str, Any]:
    await _validate_symbol_in_watchlist(mongo, claims.user_id, watchlist_name, sk_token)
    now = now_utc()

    if not is_predefined(watchlist_name):
        res = await mongo[COL_WATCHLIST].update_one(
            {
                "user_id": claims.user_id,
                "name": watchlist_name,
                "sk_tokens.sk_token": sk_token,
            },
            {
                "$set": {
                    "sk_tokens.$.note": note,
                    "updated_at": now,
                },
            },
        )
        if res.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symbol not in watchlist.")

    await mongo[COL_WATCHLIST_NOTES].update_one(
        {"user_id": claims.user_id, "watchlist_name": watchlist_name, "sk_token": sk_token},
        {
            "$set": {"note": note, "updated_at": now},
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

    return {"watchlist_name": watchlist_name, "sk_token": sk_token, "note": note}


async def delete_symbol_note(
    claims: AccessClaims,
    mongo: AsyncIOMotorDatabase,
    watchlist_name: str,
    sk_token: str,
) -> dict[str, Any]:
    now = now_utc()

    if not is_predefined(watchlist_name):
        await mongo[COL_WATCHLIST].update_one(
            {
                "user_id": claims.user_id,
                "name": watchlist_name,
                "sk_tokens.sk_token": sk_token,
            },
            {
                "$set": {
                    "sk_tokens.$.note": None,
                    "updated_at": now,
                },
            },
        )

    await mongo[COL_WATCHLIST_NOTES].delete_one(
        {"user_id": claims.user_id, "watchlist_name": watchlist_name, "sk_token": sk_token},
    )

    return {"watchlist_name": watchlist_name, "sk_token": sk_token}


async def remove_symbol_from_watchlist(
    claims: AccessClaims,
    mongo: AsyncIOMotorDatabase,
    watchlist_name: str,
    sk_token: str,
) -> dict[str, Any]:
    if is_predefined(watchlist_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove symbols from a predefined watchlist.",
        )

    col = mongo[COL_WATCHLIST]
    res = await col.update_one(
        {
            "user_id": claims.user_id,
            "name": watchlist_name,
            "sk_tokens.sk_token": sk_token,
        },
        {
            "$pull": {"sk_tokens": {"sk_token": sk_token}},
            "$set": {"updated_at": now_utc()},
        },
    )

    if res.modified_count == 1:
        doc = await col.find_one(
            {"user_id": claims.user_id, "name": watchlist_name},
            projection={"sk_tokens.sk_token": 1},
        )
        count = len((doc or {}).get("sk_tokens") or [])
        return {"watchlist_name": watchlist_name, "sk_token": sk_token, "count": count}

    exists = await col.find_one(
        {"user_id": claims.user_id, "name": watchlist_name},
        projection={"_id": 1},
    )
    if exists is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist not found.")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symbol not in watchlist.")
