from __future__ import annotations

import logging
from typing import Annotated

import redis.asyncio as aioredis
from fastapi import Depends, FastAPI, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.config import Settings

logger = logging.getLogger("svakosh.database")

MONGO_SERVER_SELECTION_TIMEOUT_MS = 10_000
REDIS_SOCKET_CONNECT_TIMEOUT = 10.0


def _exc_reason(exc: BaseException) -> str:
    return f"{type(exc).__name__}: {exc}"


async def _discard_mongo_client(client: AsyncIOMotorClient) -> None:
    try:
        await client.close()  # pyright: ignore[reportGeneralTypeIssues]
    except Exception as e:
        logger.warning(
            "MongoDB: connection closed after failed connect.\nReason: %s",
            _exc_reason(e),
            exc_info=True,
        )


async def _discard_redis_client(client: Redis) -> None:
    try:
        await client.aclose()
    except Exception as e:
        logger.warning(
            "Redis: connection closed after failed connect.\nReason: %s",
            _exc_reason(e),
            exc_info=True,
        )


def _service_or_503[T](
    request: Request,
    client: T | None,
    error_attr: str,
    fallback: str,
) -> T:
    if client is not None:
        return client
    err = getattr(request.app.state, error_attr, None)
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=err or fallback,
    )


def init_database_state(app: FastAPI) -> None:
    """Reset MongoDB / Redis slots on `app.state` before connecting."""
    app.state.mongo_client = None
    app.state.mongo_db = None
    app.state.mongodb_error = None
    app.state.redis = None
    app.state.redis_error = None


async def connect_mongo_db(app: FastAPI, settings: Settings) -> None:
    logger.info(
        "MongoDB: attempting connection (database=%s, timeout_ms=%s).",
        settings.MONGODB_DB_NAME,
        MONGO_SERVER_SELECTION_TIMEOUT_MS,
    )
    mongo_client: AsyncIOMotorClient | None = None
    try:
        mongo_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=MONGO_SERVER_SELECTION_TIMEOUT_MS,
        )
        await mongo_client.admin.command("ping")
        app.state.mongo_client = mongo_client
        app.state.mongo_db = mongo_client[settings.MONGODB_DB_NAME]
        app.state.mongodb_error = None
        mongo_client = None
        logger.info(
            "MongoDB: connected successfully (database=%s).",
            settings.MONGODB_DB_NAME,
        )
    except Exception as e:
        reason = _exc_reason(e)
        app.state.mongodb_error = reason
        logger.error(
            "MongoDB: connection failed.\nReason: %s",
            reason,
            exc_info=True,
        )
        if mongo_client is not None:
            await _discard_mongo_client(mongo_client)


async def connect_redis(app: FastAPI, settings: Settings) -> None:
    logger.info("Redis: attempting connection.")
    redis_client: Redis | None = None
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=REDIS_SOCKET_CONNECT_TIMEOUT,
        )
        await redis_client.ping()  # pyright: ignore[reportGeneralTypeIssues]
        app.state.redis = redis_client
        app.state.redis_error = None
        redis_client = None
        logger.info("Redis: connected successfully.")
    except Exception as e:
        reason = _exc_reason(e)
        app.state.redis_error = reason
        logger.error(
            "Redis: connection failed.\nReason: %s",
            reason,
            exc_info=True,
        )
        if redis_client is not None:
            await _discard_redis_client(redis_client)


async def disconnect_redis(app: FastAPI) -> None:
    redis_client: Redis | None = getattr(app.state, "redis", None)
    if redis_client is not None:
        try:
            await redis_client.aclose()
            logger.info("Redis: connection closed.")
        except Exception as e:
            logger.warning(
                "Redis: connection closed.\nReason: %s",
                _exc_reason(e),
                exc_info=True,
            )
        finally:
            app.state.redis = None
            app.state.redis_error = None


async def disconnect_mongo_db(app: FastAPI) -> None:
    mongo_client: AsyncIOMotorClient | None = getattr(app.state, "mongo_client", None)
    if mongo_client is not None:
        try:
            await mongo_client.close()  # pyright: ignore[reportGeneralTypeIssues]
            logger.info("MongoDB: connection closed.")
        except Exception as e:
            logger.warning(
                "MongoDB: connection closed.\nReason: %s",
                _exc_reason(e),
                exc_info=True,
            )
        finally:
            app.state.mongo_client = None
            app.state.mongo_db = None
            app.state.mongodb_error = None


def get_mongo_db(request: Request) -> AsyncIOMotorDatabase:
    return _service_or_503(
        request,
        getattr(request.app.state, "mongo_db", None),
        "mongodb_error",
        "MongoDB is not available.",
    )


def get_redis(request: Request) -> Redis:
    return _service_or_503(
        request,
        getattr(request.app.state, "redis", None),
        "redis_error",
        "Redis is not available.",
    )


MongoDatabase  = Annotated[AsyncIOMotorDatabase, Depends(get_mongo_db)]
RedisClient = Annotated[Redis, Depends(get_redis)]
