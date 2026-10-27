import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import health
from app.api.endpoints.auth.routes import router as auth
from app.api.endpoints.billing.jobs import billing_jobs
from app.api.endpoints.billing.router import router as billing
from app.api.endpoints.market.company import company_names
from app.api.endpoints.market.router import router as market
from app.api.endpoints.profile.router import router as profile
from app.api.endpoints.trade.router import router as trade
from app.api.endpoints.watchlist.router import router as watchlist
from app.config import get_settings
from app.database import (
    connect_mongo_db,
    connect_redis,
    disconnect_mongo_db,
    disconnect_redis,
    init_database_state,
)
from app.error_handlers import register_exception_handlers
from app.market_data import MarketDataClient
from app.razorpay import RazorpayClient
from app.responses import extract_request_payload, ok_response
from app.trade_hub import TradeHubClient

logger = logging.getLogger("svakosh.main")
settings = get_settings()


def cors_origins() -> list[str]:
    return [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    init_database_state(app)
    await connect_mongo_db(app, settings)
    await connect_redis(app, settings)
    app.state.market_data = MarketDataClient(settings.NATS_URL)
    app.state.market_data.start()
    app.state.trade_hub = TradeHubClient(settings.TRADE_HUB_NATS_URL)
    app.state.trade_hub.start()
    company_names.start()
    app.state.razorpay = RazorpayClient(
        settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET, settings.RAZORPAY_WEBHOOK_SECRET
    )
    await billing_jobs.start(app)
    try:
        yield
    finally:
        await app.state.market_data.stop()
        await app.state.trade_hub.stop()
        company_names.stop()
        billing_jobs.stop()
        await app.state.razorpay.close()
        for name, fn in (
            ("Redis", disconnect_redis),
            ("MongoDB", disconnect_mongo_db),
        ):
            try:
                await fn(app)
            except Exception as e:
                reason = f"{type(e).__name__}: {e}"
                logger.error(
                    "Shutdown: %s disconnect failed.\nReason: %s",
                    name,
                    reason,
                    exc_info=True,
                )


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Svakosh — market analysis API (REST first).",
    lifespan=lifespan,
)

register_exception_handlers(app)

app.include_router(health.router)
app.include_router(auth)
app.include_router(profile)
app.include_router(watchlist)
app.include_router(market)
app.include_router(trade)
app.include_router(billing)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root(request: Request) -> dict[str, Any]:
    pl = await extract_request_payload(request)
    logger.info("root endpoint success=True message=%s payload=%r", "Service information retrieved.", pl)
    return ok_response(
        "Service information retrieved.",
        data={
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
        },
    )
