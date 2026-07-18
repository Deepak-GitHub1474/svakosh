from __future__ import annotations

import re
from datetime import date, datetime, timezone
from typing import Annotated, Any, Literal
from bson import ObjectId
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    GetCoreSchemaHandler,
    field_validator,
)
from pydantic_core import CoreSchema, core_schema

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PAN_RE = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")
E164_RE = re.compile(r"^\+[1-9]\d{1,14}$")
PINCODE_RE = re.compile(r"^[1-9]\d{5}$")
USERNAME_RE = re.compile(r"^[a-z0-9_]{2,10}$")
REFERRAL_RE = re.compile(r"^[A-Z0-9]{6,12}$")
MOBILE_RE = re.compile(r"^\d{10}$")


def strip_lower(v: Any) -> Any:
    return v.strip().lower() if isinstance(v, str) else v


def strip(v: Any) -> Any:
    return v.strip() if isinstance(v, str) else v


def strip_upper(v: Any) -> Any:
    return v.strip().upper() if isinstance(v, str) else v


LowerStr = Annotated[str, BeforeValidator(strip_lower)]
TrimStr = Annotated[str, BeforeValidator(strip)]
UpperStr = Annotated[str, BeforeValidator(strip_upper)]


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ]),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId.")
        return ObjectId(v)


Role = Annotated[Literal["user", "admin"], BeforeValidator(strip_lower)]
Status = Annotated[Literal["pending", "active", "blocked"], BeforeValidator(strip_lower)]
Gender = Annotated[Literal["male", "female", "other", "prefer_not_to_say"], BeforeValidator(strip_lower)]
DeviceType = Annotated[Literal["mobile", "desktop", "tablet", "unknown"], BeforeValidator(strip_lower)]
OAuthProvider = Annotated[Literal["google"], BeforeValidator(strip_lower)]


class Address(BaseModel):
    city: TrimStr | None = None
    state: TrimStr | None = None
    country: TrimStr | None = None
    pincode: TrimStr | None = Field(None, pattern=PINCODE_RE.pattern)


class Profile(BaseModel):
    full_name: TrimStr = Field(..., min_length=2, max_length=40)
    username: LowerStr = Field(..., min_length=2, max_length=10, pattern=USERNAME_RE.pattern)
    avatar: TrimStr | None = None
    gender: Gender | None = None
    dob: date | None = None
    occupation: LowerStr | None = Field(None, min_length=2, max_length=20)
    pan_number: UpperStr | None = Field(None, pattern=PAN_RE.pattern)
    whatsapp_number: TrimStr | None = Field(None, pattern=E164_RE.pattern)
    whatsapp_number_verified: bool = False
    address: Address | None = None

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


class LoginInfo(BaseModel):
    date: datetime | None = None
    browser: LowerStr | None = None
    device: LowerStr | None = None
    device_type: DeviceType | None = None
    ip_address: TrimStr | None = None


class PasskeyCredential(BaseModel):
    credential_id: str
    public_key: str
    sign_count: int = 0
    transports: list[str] = Field(default_factory=list)
    aaguid: str | None = None
    device_name: TrimStr | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used_at: datetime | None = None


class OAuthAccount(BaseModel):
    provider: OAuthProvider
    provider_user_id: str
    email: LowerStr | None = None
    linked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AuthInfo(BaseModel):
    last_login: datetime | None = None
    login_count: int = 0
    blocked_count: int = 0
    login_info: LoginInfo | None = None
    passkey_credentials: list[PasskeyCredential] = Field(default_factory=list)


class User(BaseModel):
    id: PyObjectId | None = Field(alias="_id", default=None)
    role: Role = "user"
    email: LowerStr | None = Field(None, pattern=EMAIL_RE.pattern)
    mobile_number: TrimStr | None = Field(None, pattern=MOBILE_RE.pattern)
    password: str | None = None
    email_verified: bool = False
    mobile_number_verified: bool = False
    twofa_enabled: bool = False
    profile: Profile | None = None
    referral_code: UpperStr | None = Field(None, pattern=REFERRAL_RE.pattern)
    referred_by: UpperStr | None = Field(None, pattern=REFERRAL_RE.pattern)
    status: Status = "pending"
    blocked: bool = False
    auth: AuthInfo = Field(default_factory=AuthInfo)
    oauth_accounts: list[OAuthAccount] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


# --------------------------------------------------------------------------
# API request schemas
# --------------------------------------------------------------------------

def normalize_identifier(v: Any) -> Any:
    if not isinstance(v, str):
        return v
    v = v.strip()
    if EMAIL_RE.match(v):
        return v.lower()
    if v.isdigit() and len(v) == 10:
        return v
    raise ValueError("identifier: must be valid email or 10-digit mobile.")


Identifier = Annotated[str, BeforeValidator(normalize_identifier)]


class AuthRequest(BaseModel):
    identifier: Identifier


class VerifyOtpRequest(BaseModel):
    identifier: Identifier
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    referred_by: UpperStr | None = Field(None, pattern=REFERRAL_RE.pattern)


class GoogleAuthRequest(BaseModel):
    id_token: str
    referred_by: UpperStr | None = Field(None, pattern=REFERRAL_RE.pattern)
