from __future__ import annotations

import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.config import Settings, get_settings

logger = logging.getLogger("svakosh.mail")


def _build(settings: Settings, to: str, subject: str, text: str, html: str) -> EmailMessage:
    message = EmailMessage()
    message["From"] = settings.MAIL_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    message.add_alternative(html, subtype="html")
    return message


def _deliver(settings: Settings, message: EmailMessage) -> None:
    client = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
    with client:
        if settings.SMTP_USE_TLS:
            client.starttls()
        if settings.SMTP_USERNAME:
            client.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        client.send_message(message)


async def send_email(*, to: str, subject: str, text: str, html: str) -> bool:
    settings = get_settings()
    configured = bool(settings.SMTP_HOST and settings.SMTP_USERNAME)
    if settings.MAIL_PROVIDER == "smtp" and not configured:
        logger.warning("mail_not_configured to=%s subject=%s", to, subject)
    if settings.MAIL_PROVIDER == "console" or not configured:
        logger.info("mail_console to=%s subject=%s\n%s", to, subject, text)
        print(f"[DEV] mail to={to} subject={subject}\n{text}", flush=True)
        return True
    try:
        await asyncio.to_thread(_deliver, settings, _build(settings, to, subject, text, html))
    except Exception:
        logger.exception("mail_failed to=%s subject=%s", to, subject)
        return False
    logger.info("mail_sent to=%s subject=%s", to, subject)
    return True
