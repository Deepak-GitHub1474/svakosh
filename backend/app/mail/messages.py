from __future__ import annotations

from app.config import get_settings
from app.mail.template import Block, render

OTP_COPY = {
    "signin": {
        "subject": "Your Svakosh sign-in code",
        "heading": "Your sign-in code",
        "intro": "Use this code to continue signing in to your Svakosh account.",
    },
    "add_email": {
        "subject": "Confirm your Svakosh email",
        "heading": "Confirm your email",
        "intro": "Use this code to confirm this address on your Svakosh account.",
    },
}

FOOTER = (
    "Svakosh will never ask you for this code by phone, chat or email. "
    "This message was sent to you because someone requested a code for this address."
)


def otp_email(otp: str, *, purpose: str = "signin") -> tuple[str, str, str]:
    copy = OTP_COPY.get(purpose, OTP_COPY["signin"])
    minutes = max(1, get_settings().OTP_TTL_SECONDS // 60)
    blocks: list[Block] = [
        ("text", copy["intro"]),
        ("code", otp),
        ("note", f"The code expires in {minutes} minutes and can be used once."),
        (
            "text",
            "If you did not request this, ignore this email. "
            "Nobody can act on the code without access to this inbox.",
        ),
    ]
    text, html = render(
        preheader=f"{otp} is your Svakosh code. It expires in {minutes} minutes.",
        heading=copy["heading"],
        blocks=blocks,
        footer=FOOTER,
    )
    return copy["subject"], text, html
