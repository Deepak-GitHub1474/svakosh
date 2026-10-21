from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger("svakosh.responses")

SENSITIVE_KEYS = frozenset(
    {
        "otp",
        "password",
        "id_token",
        "access_token",
        "refresh_token",
        "auth_token",
        "feed_token",
        "credential",
        "credentials",
        "mpin",
        "totp_secret",
        "api_key",
        "pan_number",
    }
)


def redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            k: "***" if str(k).lower() in SENSITIVE_KEYS else redact(v)
            for k, v in value.items()
        }
    if isinstance(value, list):
        return [redact(v) for v in value]
    return value


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
                return redact(json.loads(b))
            except json.JSONDecodeError:
                return None
        if isinstance(b, (dict, list)):
            return redact(b)

    q = dict(request.query_params)
    if q:
        return redact(q)

    try:
        raw = await request.body()
        if not raw:
            return None
        return redact(json.loads(raw))
    except json.JSONDecodeError:
        return None
    except Exception as e:
        logger.debug("extract_request_payload: %s", e, exc_info=True)
        return None
