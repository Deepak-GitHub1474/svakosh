from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger("svakosh.responses")


def ok_response(
    message: str,
    *,
    data: Any = None,
) -> dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data,
    }


def err_response(
    message: str,
    *,
    data: Any = None,
) -> dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "data": data,
    }


async def extract_request_payload(request: Request, exc: BaseException | None = None) -> Any:
    """Echo of what the client sent: query dict, JSON body, or None."""
    if isinstance(exc, RequestValidationError):
        b = getattr(exc, "body", None)
        if isinstance(b, (bytes, bytearray)) and b.strip():
            try:
                return json.loads(b)
            except json.JSONDecodeError:
                return None
        if isinstance(b, (dict, list)):
            return b

    q = dict(request.query_params)
    if q:
        return q

    try:
        raw = await request.body()
        if not raw:
            return None
        return json.loads(raw)
    except json.JSONDecodeError:
        return None
    except Exception as e:
        logger.debug("extract_request_payload: %s", e, exc_info=True)
        return None
