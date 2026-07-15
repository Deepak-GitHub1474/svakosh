from __future__ import annotations

from fastapi import APIRouter, Query, status

from app.api.endpoints.watchlist import controllers
from app.api.endpoints.watchlist.models import (
    AddSymbolRequest,
    CreateWatchlistRequest,
    DeleteNoteRequest,
    DeleteWatchlistRequest,
    RemoveSymbolRequest,
    RenameWatchlistRequest,
    UpsertNoteRequest,
)
from app.database import MongoDatabase
from app.responses import ok_response
from app.utils.utils import CurrentClaims

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", status_code=status.HTTP_200_OK)
async def list_watchlists(claims: CurrentClaims, mongo: MongoDatabase):
    data = await controllers.list_user_watchlists(claims, mongo)
    return ok_response("Watchlists fetched.", data=data)


@router.get("/entries", status_code=status.HTTP_200_OK)
async def get_entries(
    claims: CurrentClaims,
    mongo: MongoDatabase,
    name: str = Query(..., min_length=1, max_length=64),
):
    data = await controllers.get_watchlist_entries(claims, mongo, name.strip())
    return ok_response("Entries fetched.", data=data)


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_watchlist(
    body: CreateWatchlistRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.create_watchlist(claims, mongo, body.name)
    return ok_response("Watchlist created.", data=data)


@router.post("/add-symbol", status_code=status.HTTP_200_OK)
async def add_symbol(
    body: AddSymbolRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.add_symbol_to_watchlist(
        claims, mongo, body.watchlist_name, body.sk_token,
    )
    return ok_response("Symbol added.", data=data)


@router.delete("/remove-symbol", status_code=status.HTTP_200_OK)
async def remove_symbol(
    body: RemoveSymbolRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.remove_symbol_from_watchlist(
        claims, mongo, body.watchlist_name, body.sk_token,
    )
    return ok_response("Symbol removed.", data=data)


@router.post("/note", status_code=status.HTTP_200_OK)
async def upsert_note(
    body: UpsertNoteRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.upsert_symbol_note(
        claims, mongo, body.watchlist_name, body.sk_token, body.note,
    )
    return ok_response("Note saved.", data=data)


@router.delete("/note", status_code=status.HTTP_200_OK)
async def delete_note(
    body: DeleteNoteRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.delete_symbol_note(
        claims, mongo, body.watchlist_name, body.sk_token,
    )
    return ok_response("Note deleted.", data=data)


@router.put("/rename", status_code=status.HTTP_200_OK)
async def rename_watchlist(
    body: RenameWatchlistRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.rename_watchlist(
        claims, mongo, body.old_name, body.new_name,
    )
    return ok_response("Watchlist renamed.", data=data)


@router.delete("/delete", status_code=status.HTTP_200_OK)
async def delete_watchlist(
    body: DeleteWatchlistRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.delete_watchlist(claims, mongo, body.name)
    return ok_response("Watchlist deleted.", data=data)
