from __future__ import annotations

import logging

import httpx

from app.config import get_settings

logger = logging.getLogger("svakosh.sms")

GATEWAY_URL = "https://api.sms-gate.app/3rdparty/v1/messages"


async def send_sms(*, to: str, text: str, ttl_seconds: int) -> bool:
    settings = get_settings()
    if not (settings.SMS_GATEWAY_USER and settings.SMS_GATEWAY_PASSWORD):
        logger.warning("sms_not_configured to=%s", to)
        return True
    payload = {
        "textMessage": {"text": text},
        "phoneNumbers": [to],
        "ttl": ttl_seconds,
        "withDeliveryReport": False,
    }
    try:
        async with httpx.AsyncClient(timeout=15, headers={"User-Agent": "svakosh-api"}) as client:
            response = await client.post(
                GATEWAY_URL,
                json=payload,
                auth=(settings.SMS_GATEWAY_USER, settings.SMS_GATEWAY_PASSWORD),
            )
            response.raise_for_status()
    except httpx.HTTPError:
        logger.exception("sms_failed to=%s", to)
        return False
    logger.info("sms_queued to=%s", to)
    return True
