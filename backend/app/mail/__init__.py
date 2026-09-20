from app.mail.messages import otp_email
from app.mail.sender import send_email
from app.mail.template import Block, render

__all__ = ["Block", "otp_email", "render", "send_email"]
