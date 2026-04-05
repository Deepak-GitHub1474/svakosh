from typing import Any

from fastapi import APIRouter, Request

from app.config import get_settings
from app.responses import extract_request_payload, ok_envelope

router = APIRouter(tags=["Health"])


@router.get("/health")
async def server_health(request: Request) -> dict[str, Any]:
    pl = await extract_request_payload(request)
    s = get_settings()
    return ok_envelope(
        "Server is up and running.",
        data={
            "service": s.APP_NAME,
            "version": s.APP_VERSION,
            "env": s.API_ENV,
        },
        payload=pl,
    )
