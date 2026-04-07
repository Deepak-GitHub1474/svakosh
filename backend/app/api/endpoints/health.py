import logging
from typing import Any

from fastapi import APIRouter, Request

from app.config import get_settings
from app.responses import extract_request_payload, ok_response

router = APIRouter(tags=["Health"])
logger = logging.getLogger("svakosh.health")


@router.get("/health")
async def server_health(request: Request) -> dict[str, Any]:
    pl = await extract_request_payload(request)
    logger.info("health endpoint success=True message=%s payload=%r", "Server is up and running.", pl)
    s = get_settings()
    return ok_response(
        "Server is up and running.",
        data={
            "service": s.APP_NAME,
            "version": s.APP_VERSION,
            "env": s.API_ENV,
        },
    )
