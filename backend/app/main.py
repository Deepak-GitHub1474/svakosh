import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import health
from app.config import get_settings
from app.database import (
    connect_mongo_db,
    connect_redis,
    disconnect_mongo_db,
    disconnect_redis,
    init_database_state,
)
from app.error_handlers import register_exception_handlers
from app.responses import extract_request_payload, ok_response

logger = logging.getLogger("svakosh.main")
settings = get_settings()


def _cors_origins() -> list[str]:
    return [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_database_state(app)
    await connect_mongo_db(app, settings)
    await connect_redis(app, settings)
    try:
        yield
    finally:
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
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
