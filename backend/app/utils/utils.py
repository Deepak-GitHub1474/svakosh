from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import os
import time
from datetime import date, datetime, timezone
from typing import Annotated, Callable

import jwt
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import Depends, HTTPException, Request, status

from app.api.endpoints.auth.utils import (
    AccessClaims,
    TokenInvalidError,
    TokenRevokedError,
    jwt_deny_key,
    rate_limit_key,
)
from app.config import get_settings
from app.database import RedisClient


# --------------------------------------------------------------------------
# Time helpers
# --------------------------------------------------------------------------

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_epoch() -> int:
    return int(time.time())


def date_to_ddmmyyyy(value: date) -> str:
    return value.strftime("%d-%m-%Y")


def dob_to_iso(value: object) -> str | None:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, str) and value:
        try:
            return datetime.strptime(value, "%d-%m-%Y").date().isoformat()
        except ValueError:
            return value[:10]
    return None


# --------------------------------------------------------------------------
# Access token: read + verify
# --------------------------------------------------------------------------

def read_access_token(request: Request) -> str:
    settings = get_settings()
    cookie_token = request.cookies.get(settings.ACCESS_COOKIE_NAME)
    if cookie_token:
        return cookie_token
    auth = request.headers.get("authorization", "")
    parts = auth.split(None, 1)
    if len(parts) == 2 and parts[0].lower() == "bearer" and parts[1]:
        return parts[1]
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing access token.",
    )


async def verify_access_token(redis: RedisClient, token: str) -> AccessClaims:
    s = get_settings()
    try:
        payload = jwt.decode(token, s.JWT_SECRET, algorithms=[s.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as e:
        raise TokenInvalidError("Access token expired.") from e
    except jwt.InvalidTokenError as e:
        raise TokenInvalidError("Invalid access token.") from e

    jti = payload.get("jti")
    if not jti:
        raise TokenInvalidError("Access token missing jti.")
    if await redis.exists(jwt_deny_key(jti)):
        raise TokenRevokedError("Access token revoked.")

    return AccessClaims(
        user_id=payload["user_id"],
        role=payload["role"],
        status=payload.get("status", ""),
        avatar=payload.get("avatar"),
        full_name=payload.get("full_name"),
        email_verified=bool(payload.get("email_verified", False)),
        mobile_verified=bool(payload.get("mobile_verified", False)),
        family_id=payload.get("family_id", ""),
        jti=jti,
        exp=payload["exp"],
        iat=payload["iat"],
    )


async def get_current_claims(request: Request, redis: RedisClient) -> AccessClaims:
    token = read_access_token(request)
    try:
        claims = await verify_access_token(redis, token)
    except (TokenInvalidError, TokenRevokedError) as e:
        raise HTTPException(status_code=401, detail=str(e)) from e
    return claims


CurrentClaims = Annotated[AccessClaims, Depends(get_current_claims)]


# --------------------------------------------------------------------------
# CSRF
# --------------------------------------------------------------------------

async def csrf_protect(request: Request) -> None:
    s = get_settings()
    cookie_val = request.cookies.get(s.CSRF_COOKIE_NAME, "")
    header_val = request.headers.get(s.CSRF_HEADER_NAME, "")
    if not cookie_val or not header_val:
        raise HTTPException(status_code=403, detail="CSRF token missing.")
    if not hmac.compare_digest(cookie_val, header_val):
        raise HTTPException(status_code=403, detail="CSRF token mismatch.")


# --------------------------------------------------------------------------
# Rate limit (FastAPI dependency factory)
# --------------------------------------------------------------------------

def rate_limit(max_calls: int, window_seconds: int, scope: str | None = None) -> Callable:
    async def dependency(request: Request, redis: RedisClient) -> None:
        bucket = scope or request.url.path
        ip = (
            (request.headers.get("x-forwarded-for") or "").split(",")[0].strip()
            or (request.client.host if request.client else "unknown")
        )
        key = rate_limit_key(bucket, ip)
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, window_seconds)
        if count > max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Try again later.",
            )

    return dependency


# --------------------------------------------------------------------------
# Encryption
# --------------------------------------------------------------------------

_NONCE_BYTES = 12


class DecryptionError(Exception):
    pass


def _encryption_key() -> bytes:
    return hashlib.sha256(get_settings().ENCRYPTION_KEY.encode()).digest()


def encrypt(plaintext: str) -> str:
    aesgcm = AESGCM(_encryption_key())
    nonce = os.urandom(_NONCE_BYTES)
    ct = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ct).decode()


def decrypt(ciphertext: str) -> str:
    aesgcm = AESGCM(_encryption_key())
    try:
        data = base64.b64decode(ciphertext.encode())
    except (binascii.Error, ValueError) as exc:
        raise DecryptionError("Ciphertext is not valid base64") from exc
    if len(data) <= _NONCE_BYTES:
        raise DecryptionError("Ciphertext too short to contain nonce")
    nonce, ct = data[:_NONCE_BYTES], data[_NONCE_BYTES:]
    try:
        return aesgcm.decrypt(nonce, ct, None).decode()
    except InvalidTag as exc:
        raise DecryptionError("ENCRYPTION_KEY mismatch or corrupt ciphertext") from exc


def mask_pan(pan: str) -> str:
    if len(pan) != 10:
        return pan
    return pan[:3] + "XXXXX" + pan[8:]
