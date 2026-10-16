from __future__ import annotations

from fastapi import APIRouter, Query, WebSocket, status

from app.api.endpoints.auth.controllers import redeem_ws_ticket
from app.api.endpoints.market import controllers
from app.api.endpoints.market.constants import WS_PROTOCOL
from app.api.endpoints.market.socket import stream_market
from app.market_data import MarketData
from app.responses import ok_response
from app.utils.utils import CurrentClaims

router = APIRouter(prefix="/market", tags=["Market"])


@router.get("/overview", status_code=status.HTTP_200_OK)
async def market_overview(claims: CurrentClaims, market: MarketData):
    data = await controllers.market_overview(market)
    return ok_response("Market overview fetched.", data=data)


@router.get("/search", status_code=status.HTTP_200_OK)
async def search(claims: CurrentClaims, market: MarketData, q: str = Query(..., min_length=2, max_length=64)):
    data = await controllers.search_symbols(market, q.strip())
    return ok_response("Symbols found.", data=data)


@router.get("/intraday", status_code=status.HTTP_200_OK)
async def intraday(claims: CurrentClaims, market: MarketData, token: str = Query(..., min_length=5, max_length=64)):
    data = await controllers.intraday(market, token.strip())
    return ok_response("Intraday candles fetched.", data=data)


@router.get("/chains", status_code=status.HTTP_200_OK)
async def option_chains(claims: CurrentClaims, market: MarketData):
    data = await controllers.option_chains(market)
    return ok_response("Option chains fetched.", data=data)


@router.get("/chain", status_code=status.HTTP_200_OK)
async def option_chain(
    claims: CurrentClaims,
    market: MarketData,
    exchange: str = Query(..., pattern="^(NFO|BFO)$"),
    underlying: str = Query(..., min_length=1, max_length=32),
):
    data = await controllers.option_chain(market, exchange, underlying.strip().upper())
    return ok_response("Option chain fetched.", data=data)


@router.get("/bars", status_code=status.HTTP_200_OK)
async def bars(
    claims: CurrentClaims,
    market: MarketData,
    subject: str = Query(..., pattern="^(NSE|BSE|NFO|BFO)\\.[A-Z0-9&_-]+$"),
    prefix: str = Query("", max_length=64),
    interval: int = Query(5, ge=1, le=60),
    minutes: int = Query(0, ge=0, le=400),
):
    data = await controllers.bars(market, subject, prefix, interval, minutes)
    return ok_response("Bars fetched.", data=data)


@router.get("/avg-volume", status_code=status.HTTP_200_OK)
async def avg_volume(claims: CurrentClaims, market: MarketData):
    data = await market.avg_volumes()
    return ok_response("Average volumes fetched.", data=data)


@router.websocket("/socket")
async def market_socket(websocket: WebSocket):
    offered = [p.strip() for p in websocket.headers.get("sec-websocket-protocol", "").split(",")]
    ticket = offered[1] if len(offered) == 2 and offered[0] == WS_PROTOCOL else ""
    user_id = await redeem_ws_ticket(websocket.app.state.redis, ticket)
    if user_id is None:
        await websocket.close(code=4401)
        return
    await websocket.accept(subprotocol=WS_PROTOCOL)
    await stream_market(websocket, websocket.app.state.market_data)
