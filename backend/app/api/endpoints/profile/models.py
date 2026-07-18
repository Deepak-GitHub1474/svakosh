from __future__ import annotations

from datetime import date, datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.api.endpoints.auth.models import (
    MOBILE_RE,
    PAN_RE,
    Address,
    Gender,
    TrimStr,
    UpperStr,
)


class UpdateProfileRequest(BaseModel):
    full_name: TrimStr | None = Field(None, min_length=2, max_length=40)
    gender: Gender | None = None
    dob: date | None = None
    occupation: TrimStr | None = Field(None, min_length=2, max_length=20)
    pan_number: UpperStr | None = Field(None, pattern=PAN_RE.pattern)
    address: Address | None = None
    model_config = ConfigDict(extra="forbid")

    @field_validator("dob")
    @classmethod
    def validate_dob(cls, v: date | None) -> date | None:
        if v is None:
            return v
        today = datetime.now(timezone.utc).date()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 16:
            raise ValueError("Minimum age is 16.")
        return v


class WhatsappSendOtpRequest(BaseModel):
    whatsapp_number: TrimStr = Field(..., pattern=MOBILE_RE.pattern)
    model_config = ConfigDict(extra="forbid")


class WhatsappVerifyRequest(BaseModel):
    whatsapp_number: TrimStr = Field(..., pattern=MOBILE_RE.pattern)
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    model_config = ConfigDict(extra="forbid")
