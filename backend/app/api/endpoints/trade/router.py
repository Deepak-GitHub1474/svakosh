from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Path, Query, status

from app.api.endpoints.trade import controllers
from app.api.endpoints.trade.models import (
    BasketMarginRequest,
    ConvertRequest,
    LinkAccountRequest,
    ModifyOrderRequest,
    PlaceBasketRequest,
    PlaceOrderRequest,
    SaveBasketRequest,
    SessionRequest,
    Ticket,
    UpdateAccountRequest,
)
from app.responses import ok_response
from app.trade_hub import TradeHub
from app.utils.utils import CurrentClaims

router = APIRouter(prefix="/trade", tags=["Trade"])

AccountId = Path(..., pattern=r"^[a-f0-9]{24}$")
BasketId = Path(..., pattern=r"^[a-f0-9]{24}$")
OrderId = Path(..., min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
AccountQuery = Query("", max_length=24)


@router.get("/accounts", status_code=status.HTTP_200_OK)
async def list_accounts(claims: CurrentClaims, trade: TradeHub):
    data = await controllers.list_accounts(trade, claims)
    return ok_response("Broker accounts fetched.", data=data)


@router.post("/accounts", status_code=status.HTTP_201_CREATED)
async def link_account(
    body: LinkAccountRequest, claims: CurrentClaims, trade: TradeHub
):
    data = await controllers.link_account(trade, claims, body)
    return ok_response("Broker account linked.", data=data)


@router.patch("/accounts/{account_id}", status_code=status.HTTP_200_OK)
async def update_account(
    body: UpdateAccountRequest,
    claims: CurrentClaims,
    trade: TradeHub,
    account_id: str = AccountId,
):
    data = await controllers.update_account(trade, claims, account_id, body)
    return ok_response("Broker account updated.", data=data)


@router.get("/accounts/{account_id}/login", status_code=status.HTTP_200_OK)
async def login_url(
    claims: CurrentClaims, trade: TradeHub, account_id: str = AccountId
):
    data = await controllers.login_url(trade, claims, account_id)
    return ok_response("Broker login link ready.", data=data)


@router.post("/accounts/{account_id}/session", status_code=status.HTTP_200_OK)
async def connect_session(
    body: SessionRequest,
    claims: CurrentClaims,
    trade: TradeHub,
    account_id: str = AccountId,
):
    data = await controllers.connect_session(trade, claims, account_id, body)
    return ok_response("Broker logged in.", data=data)


@router.delete("/accounts/{account_id}", status_code=status.HTTP_200_OK)
async def unlink_account(
    claims: CurrentClaims, trade: TradeHub, account_id: str = AccountId
):
    await controllers.unlink_account(trade, claims, account_id)
    return ok_response("Broker account unlinked.")


@router.get("/positions", status_code=status.HTTP_200_OK)
async def positions(
    claims: CurrentClaims, trade: TradeHub, account_id: str = AccountQuery
):
    data = await controllers.portfolio(trade, claims, "positions", account_id)
    return ok_response("Positions fetched.", data=data)


@router.get("/holdings", status_code=status.HTTP_200_OK)
async def holdings(
    claims: CurrentClaims, trade: TradeHub, account_id: str = AccountQuery
):
    data = await controllers.portfolio(trade, claims, "holdings", account_id)
    return ok_response("Holdings fetched.", data=data)


@router.get("/trades", status_code=status.HTTP_200_OK)
async def trades(
    claims: CurrentClaims, trade: TradeHub, account_id: str = AccountQuery
):
    data = await controllers.portfolio(trade, claims, "trades", account_id)
    return ok_response("Trades fetched.", data=data)


@router.get("/funds", status_code=status.HTTP_200_OK)
async def funds(claims: CurrentClaims, trade: TradeHub, account_id: str = AccountQuery):
    data = await controllers.portfolio(trade, claims, "funds", account_id)
    return ok_response("Funds fetched.", data=data)


@router.get("/orders", status_code=status.HTTP_200_OK)
async def order_book(
    claims: CurrentClaims, trade: TradeHub, account_id: str = AccountQuery
):
    data = await controllers.order_book(trade, claims, account_id)
    return ok_response("Orders fetched.", data=data)


@router.get("/orders/history", status_code=status.HTTP_200_OK)
async def order_history(
    claims: CurrentClaims,
    trade: TradeHub,
    account_id: str = AccountQuery,
    before: str | None = Query(None, max_length=40),
    limit: int = Query(50, ge=1, le=controllers.HISTORY_LIMIT_MAX),
):
    data = await controllers.order_history(trade, claims, account_id, before, limit)
    return ok_response("Order history fetched.", data=data)


@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def place_order(body: PlaceOrderRequest, claims: CurrentClaims, trade: TradeHub):
    data = await controllers.place_order(trade, claims, body)
    return ok_response("Order placed.", data=data)


@router.post("/orders/margin", status_code=status.HTTP_200_OK)
async def order_margin(body: Ticket, claims: CurrentClaims, trade: TradeHub):
    data = await controllers.order_margin(trade, claims, body)
    return ok_response("Margin calculated.", data=data)


@router.patch("/orders/{order_id}", status_code=status.HTTP_200_OK)
async def modify_order(
    body: ModifyOrderRequest,
    claims: CurrentClaims,
    trade: TradeHub,
    order_id: str = OrderId,
):
    await controllers.modify_order(trade, claims, order_id, body)
    return ok_response("Order modified.")


@router.delete("/orders/{order_id}", status_code=status.HTTP_200_OK)
async def cancel_order(
    claims: CurrentClaims,
    trade: TradeHub,
    order_id: str = OrderId,
    account_id: str = AccountQuery,
    order_type: Literal["MARKET", "LIMIT", "SL", "SL-M"] = Query("LIMIT", alias="type"),
    token: str = Query("", max_length=80),
):
    await controllers.cancel_order(
        trade, claims, order_id, account_id, order_type, token
    )
    return ok_response("Order cancelled.")


@router.post("/positions/convert", status_code=status.HTTP_200_OK)
async def convert_position(
    body: ConvertRequest, claims: CurrentClaims, trade: TradeHub
):
    await controllers.convert_position(trade, claims, body)
    return ok_response("Position converted.")


@router.get("/baskets", status_code=status.HTTP_200_OK)
async def list_baskets(claims: CurrentClaims, trade: TradeHub):
    data = await controllers.list_baskets(trade, claims)
    return ok_response("Baskets fetched.", data=data)


@router.post("/baskets", status_code=status.HTTP_201_CREATED)
async def create_basket(
    body: SaveBasketRequest, claims: CurrentClaims, trade: TradeHub
):
    data = await controllers.save_basket(trade, claims, body)
    return ok_response("Basket saved.", data=data)


@router.put("/baskets/{basket_id}", status_code=status.HTTP_200_OK)
async def update_basket(
    body: SaveBasketRequest,
    claims: CurrentClaims,
    trade: TradeHub,
    basket_id: str = BasketId,
):
    data = await controllers.save_basket(trade, claims, body, basket_id)
    return ok_response("Basket saved.", data=data)


@router.delete("/baskets/{basket_id}", status_code=status.HTTP_200_OK)
async def delete_basket(
    claims: CurrentClaims, trade: TradeHub, basket_id: str = BasketId
):
    await controllers.delete_basket(trade, claims, basket_id)
    return ok_response("Basket deleted.")


@router.post("/baskets/margin", status_code=status.HTTP_200_OK)
async def basket_margin(
    body: BasketMarginRequest, claims: CurrentClaims, trade: TradeHub
):
    data = await controllers.basket_margin(trade, claims, body)
    return ok_response("Margin calculated.", data=data)


@router.post("/baskets/place", status_code=status.HTTP_200_OK)
async def place_basket(
    body: PlaceBasketRequest, claims: CurrentClaims, trade: TradeHub
):
    data = await controllers.place_basket(trade, claims, body)
    return ok_response("Basket placed.", data=data)
