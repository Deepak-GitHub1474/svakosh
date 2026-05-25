from __future__ import annotations

import hashlib
import hmac
import logging
import secrets
import string
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from bson import ObjectId
from fastapi import HTTPException, Request, Response
from jwt import PyJWKClient
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.endpoints.auth.models import EMAIL_RE
from app.config import get_settings

logger = logging.getLogger("svakosh.auth.utils")

NS = "SK"
OTP_TTL_SECONDS = 300
REFERRAL_LENGTH = 6
REFERRAL_ALPHABET = string.ascii_uppercase + string.digits
REFERRAL_MAX_TRIES = 50


# --------------------------------------------------------------------------
# Redis key builders
# --------------------------------------------------------------------------

def jwt_deny_key(jti: str) -> str:
    return f"{NS}:JWT_DENY:{jti}"


def refresh_token_key(rt_hash: str) -> str:
    return f"{NS}:RT:{rt_hash}"


def refresh_family_key(family_id: str) -> str:
    return f"{NS}:RT_FAMILY:{family_id}"


def family_meta_key(family_id: str) -> str:
    return f"{NS}:FAMILY_META:{family_id}"


def refresh_revoked_hash_key(rt_hash: str) -> str:
    return f"{NS}:RT_REVOKED_HASH:{rt_hash}"


def user_sessions_key(user_id: str) -> str:
    return f"{NS}:USER_SESSIONS:{user_id}"


def rate_limit_key(scope: str, ident: str) -> str:
    return f"{NS}:RL:{scope}:{ident}"


def otp_key(identifier: str) -> str:
    return f"{NS}:OTP:{identifier}"


# --------------------------------------------------------------------------
# Identifier helpers
# --------------------------------------------------------------------------

def detect_identifier(value: str) -> str:
    v = value.strip()
    if EMAIL_RE.match(v):
        return "email"
    if v.isdigit() and len(v) == 10:
        return "mobile"
    raise ValueError("Identifier must be a valid email or 10-digit mobile number.")


def mongo_query_for_identifier(ident_type: str, identifier: str) -> dict[str, Any]:
    field = "email" if ident_type == "email" else "mobile_number"
    return {field: identifier}


def is_locked(user: dict[str, Any]) -> bool:
    return bool(user.get("blocked", False))


def detect_device_type(ua: str) -> str:
    u = (ua or "").lower()
    if "mobile" in u or "android" in u or "iphone" in u:
        return "mobile"
    if "tablet" in u or "ipad" in u:
        return "tablet"
    if u:
        return "desktop"
    return "unknown"


def detect_browser(ua: str) -> str | None:
    if not ua:
        return None
    if "Edg/" in ua:
        return "edge"
    if "OPR/" in ua or "Opera" in ua:
        return "opera"
    if "Firefox/" in ua:
        return "firefox"
    if "Chrome/" in ua:
        return "chrome"
    if "Safari/" in ua:
        return "safari"
    return None


def detect_device(ua: str) -> str | None:
    if not ua:
        return None
    if "iPhone" in ua:
        return "iphone"
    if "iPad" in ua:
        return "ipad"
    if "Android" in ua:
        return "android"
    if "Windows NT" in ua:
        return "windows"
    if "Mac OS X" in ua or "Macintosh" in ua:
        return "mac"
    if "Linux" in ua:
        return "linux"
    return None


# --------------------------------------------------------------------------
# Referral code
# --------------------------------------------------------------------------

def generate_referral_code() -> str:
    return "".join(secrets.choice(REFERRAL_ALPHABET) for _ in range(REFERRAL_LENGTH))


async def generate_unique_referral_code(mongo: AsyncIOMotorDatabase) -> str:
    users = mongo["users"]
    tried: set[str] = set()
    for _ in range(REFERRAL_MAX_TRIES):
        code = generate_referral_code()
        if code in tried:
            continue
        tried.add(code)
        existing = await users.find_one({"referral_code": code}, projection={"_id": 1})
        if existing is None:
            return code
    logger.error("referral exhausted after %d tries", REFERRAL_MAX_TRIES)
    raise RuntimeError("Failed to generate unique referral code after retries.")


# --------------------------------------------------------------------------
# Google OAuth (ID-token verification)
# --------------------------------------------------------------------------

class OAuthError(Exception):
    pass


google_jwks_client: PyJWKClient | None = None


def get_google_jwks_client() -> PyJWKClient:
    global google_jwks_client
    if google_jwks_client is None:
        google_jwks_client = PyJWKClient(get_settings().GOOGLE_JWKS_URL, cache_keys=True)
    return google_jwks_client


async def verify_google_id_token(token: str) -> dict[str, Any]:
    s = get_settings()
    if not s.GOOGLE_CLIENT_ID:
        raise OAuthError("Google OAuth not configured.")
    issuers = [i.strip() for i in s.GOOGLE_ISSUERS.split(",") if i.strip()]
    try:
        signing_key = get_google_jwks_client().get_signing_key_from_jwt(token)
        alg = jwt.get_unverified_header(token).get("alg", "RS256")
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=[alg],
            audience=s.GOOGLE_CLIENT_ID,
            options={"require": ["sub", "iss", "aud", "exp"]},
        )
    except jwt.InvalidTokenError as e:
        raise OAuthError(f"Invalid id_token: {e}") from e
    if claims.get("iss") not in issuers:
        raise OAuthError("Invalid id_token issuer.")
    if not claims.get("email_verified"):
        raise OAuthError("Google email not verified.")
    return {
        "provider_user_id": claims["sub"],
        "email": claims.get("email"),
        "name": claims.get("name"),
        "picture": claims.get("picture"),
    }


# --------------------------------------------------------------------------
# Tokens (access JWT + refresh)
# --------------------------------------------------------------------------

class TokenError(Exception):
    pass


class TokenInvalidError(TokenError):
    pass


class TokenRevokedError(TokenError):
    pass


class TokenReusedError(TokenError):
    pass


@dataclass(frozen=True, slots=True)
class AccessClaims:
    user_id: str
    role: str
    status: str
    avatar: str | None
    full_name: str | None
    email_verified: bool
    mobile_verified: bool
    family_id: str
    jti: str
    exp: int
    iat: int


def create_access_token(user: dict[str, Any], family_id: str) -> tuple[str, str, int]:
    s = get_settings()
    now = datetime.now(timezone.utc)
    iat = int(now.timestamp())
    exp = int((now + timedelta(minutes=s.ACCESS_TOKEN_TTL_MINUTES)).timestamp())
    jti = secrets.token_urlsafe(16)
    profile = user.get("profile") or {}
    payload = {
        "user_id": str(user["_id"]),
        "role": user.get("role", "user"),
        "status": user.get("status", ""),
        "avatar": profile.get("avatar"),
        "full_name": profile.get("full_name"),
        "email_verified": bool(user.get("email_verified", False)),
        "mobile_verified": bool(user.get("mobile_number_verified", False)),
        "family_id": family_id,
        "jti": jti,
        "iat": iat,
        "exp": exp,
    }
    token = jwt.encode(payload, s.JWT_SECRET, algorithm=s.JWT_ALGORITHM)
    return token, jti, exp


def hash_refresh_token(rt: str) -> str:
    return hashlib.sha256(rt.encode()).hexdigest()


async def issue_refresh_token(
    redis: Any,
    user_id: str,
    *,
    family_id: str | None = None,
    ip: str | None = None,
    ua: str | None = None,
) -> tuple[str, str]:
    s = get_settings()
    rt = secrets.token_urlsafe(32)
    rt_hash = hash_refresh_token(rt)
    is_new_family = family_id is None
    if family_id is None:
        family_id = secrets.token_urlsafe(16)

    ttl_seconds = s.REFRESH_TOKEN_TTL_DAYS * 86400
    rt_key = refresh_token_key(rt_hash)
    fam_key = refresh_family_key(family_id)
    fam_meta = family_meta_key(family_id)
    usr_key = user_sessions_key(user_id)
    now_ts = int(datetime.now(timezone.utc).timestamp())

    pipe = redis.pipeline(transaction=False)
    pipe.hset(rt_key, mapping={
        "user_id": user_id,
        "family_id": family_id,
        "issued_at": str(now_ts),
        "ip": ip or "",
        "ua": ua or "",
    })
    pipe.expire(rt_key, ttl_seconds)
    pipe.sadd(fam_key, rt_hash)
    pipe.expire(fam_key, ttl_seconds)
    if is_new_family:
        pipe.hset(fam_meta, mapping={
            "user_id": user_id,
            "created_at": str(now_ts),
            "last_used_at": str(now_ts),
            "ip": ip or "",
            "ua": ua or "",
        })
    else:
        pipe.hset(fam_meta, mapping={
            "last_used_at": str(now_ts),
            "ip": ip or "",
            "ua": ua or "",
        })
    pipe.expire(fam_meta, ttl_seconds)
    pipe.sadd(usr_key, family_id)
    pipe.expire(usr_key, ttl_seconds)
    await pipe.execute()

    return rt, family_id


async def rotate_refresh_token(
    redis: Any,
    presented_rt: str,
    *,
    ip: str | None = None,
    ua: str | None = None,
) -> tuple[str, str, str]:
    s = get_settings()
    rt_hash = hash_refresh_token(presented_rt)
    rt_key = refresh_token_key(rt_hash)
    record = await redis.hgetall(rt_key)

    if not record:
        revoked_family = await redis.get(refresh_revoked_hash_key(rt_hash))
        if revoked_family:
            await revoke_family(redis, revoked_family)
            raise TokenReusedError("Refresh token reuse detected. Session revoked.")
        raise TokenInvalidError("Refresh token unknown or expired.")

    user_id = record["user_id"]
    family_id = record["family_id"]

    new_rt = secrets.token_urlsafe(32)
    new_hash = hash_refresh_token(new_rt)
    now_ts = int(datetime.now(timezone.utc).timestamp())
    ttl_seconds = s.REFRESH_TOKEN_TTL_DAYS * 86400
    new_key = refresh_token_key(new_hash)
    fam_key = refresh_family_key(family_id)
    fam_meta = family_meta_key(family_id)

    pipe = redis.pipeline(transaction=False)
    pipe.delete(rt_key)
    pipe.srem(fam_key, rt_hash)
    pipe.set(refresh_revoked_hash_key(rt_hash), family_id, ex=ttl_seconds)
    pipe.hset(new_key, mapping={
        "user_id": user_id,
        "family_id": family_id,
        "issued_at": str(now_ts),
        "ip": ip or "",
        "ua": ua or "",
    })
    pipe.expire(new_key, ttl_seconds)
    pipe.sadd(fam_key, new_hash)
    pipe.expire(fam_key, ttl_seconds)
    pipe.hset(fam_meta, mapping={
        "last_used_at": str(now_ts),
        "ip": ip or "",
        "ua": ua or "",
    })
    pipe.expire(fam_meta, ttl_seconds)
    await pipe.execute()

    return new_rt, family_id, user_id


async def revoke_family(redis: Any, family_id: str) -> None:
    fam_key = refresh_family_key(family_id)
    fam_meta = family_meta_key(family_id)
    members = await redis.smembers(fam_key)
    meta = await redis.hgetall(fam_meta)
    user_id = meta.get("user_id") if meta else None
    pipe = redis.pipeline(transaction=False)
    if members:
        pipe.delete(*[refresh_token_key(h) for h in members])
    pipe.delete(fam_key)
    pipe.delete(fam_meta)
    if user_id:
        pipe.srem(user_sessions_key(user_id), family_id)
    await pipe.execute()


async def revoke_access_token(redis: Any, jti: str, exp_epoch: int) -> None:
    ttl = max(1, exp_epoch - int(datetime.now(timezone.utc).timestamp()))
    await redis.set(jwt_deny_key(jti), "1", ex=ttl)


async def list_user_sessions(
    redis: Any, user_id: str, current_family_id: str | None = None,
) -> list[dict[str, Any]]:
    family_ids = await redis.smembers(user_sessions_key(user_id))
    sessions: list[dict[str, Any]] = []
    for fid in family_ids:
        meta = await redis.hgetall(family_meta_key(fid))
        if not meta:
            continue
        sessions.append({
            "session_id": fid,
            "ip": meta.get("ip") or None,
            "ua": meta.get("ua") or None,
            "created_at": int(meta["created_at"]) if meta.get("created_at") else None,
            "last_used_at": int(meta["last_used_at"]) if meta.get("last_used_at") else None,
            "is_current": fid == current_family_id,
        })
    sessions.sort(key=lambda s: s.get("last_used_at") or 0, reverse=True)
    return sessions


# --------------------------------------------------------------------------
# OTP: local generation + Redis storage + HMAC-keyed check
# --------------------------------------------------------------------------

def hash_otp(otp: str) -> str:
    secret = get_settings().OTP_HMAC_SECRET.encode()
    return hmac.new(secret, otp.encode(), hashlib.sha256).hexdigest()


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


async def save_otp(redis: Any, identifier: str, otp: str) -> None:
    """Set/refresh OTP. Preserves attempts counter across re-sends so refresh can't bypass lockout."""
    s = get_settings()
    key = otp_key(identifier)
    now_ts = int(datetime.now(timezone.utc).timestamp())
    pipe = redis.pipeline(transaction=False)
    pipe.hset(key, mapping={
        "hash": hash_otp(otp),
        "otp_expires_at": str(now_ts + OTP_TTL_SECONDS),
    })
    pipe.hsetnx(key, "attempts", "0")
    pipe.expire(key, s.OTP_LOCKOUT_MINUTES * 60)
    await pipe.execute()


async def is_otp_locked(redis: Any, identifier: str) -> bool:
    s = get_settings()
    attempts_raw = await redis.hget(otp_key(identifier), "attempts")
    return int(attempts_raw or 0) >= s.OTP_LOCKOUT_FAIL_THRESHOLD


async def get_otp_status(redis: Any, identifier: str) -> dict[str, Any]:
    s = get_settings()
    key = otp_key(identifier)
    attempts_raw = await redis.hget(key, "attempts")
    attempts = int(attempts_raw or 0)
    remaining = max(0, s.OTP_LOCKOUT_FAIL_THRESHOLD - attempts)
    retry_after: int | None = None
    if remaining == 0:
        ttl = await redis.ttl(key)
        retry_after = int(ttl) if isinstance(ttl, int) and ttl > 0 else s.OTP_LOCKOUT_MINUTES * 60
    return {
        "attempts_used": attempts,
        "attempts_remaining": remaining,
        "retry_after_seconds": retry_after,
        "locked": remaining == 0,
    }


def build_otp_error_detail(
    status: dict[str, Any], *, is_new_user: bool, is_blocked: bool,
) -> dict[str, Any]:
    return {
        "code": "OTP_LOCKED" if status["locked"] else "INVALID_OTP",
        "message": "Too many wrong attempts. Try again later." if status["locked"] else "Invalid or expired OTP.",
        "is_new_user": is_new_user,
        "is_blocked": is_blocked,
        **status,
    }


async def check_otp(redis: Any, identifier: str, presented_otp: str) -> bool:
    key = otp_key(identifier)
    record = await redis.hgetall(key)
    if not record:
        return False
    s = get_settings()
    attempts = int(record.get("attempts", "0"))

    if attempts >= s.OTP_LOCKOUT_FAIL_THRESHOLD:
        if "hash" in record:
            await redis.hdel(key, "hash", "otp_expires_at")
        return False

    otp_exp = int(record.get("otp_expires_at", "0"))
    if int(datetime.now(timezone.utc).timestamp()) > otp_exp:
        await redis.hdel(key, "hash", "otp_expires_at")
        await redis.hincrby(key, "attempts", 1)
        return False

    if hmac.compare_digest(record.get("hash", ""), hash_otp(presented_otp)):
        await redis.delete(key)
        return True

    new_attempts = await redis.hincrby(key, "attempts", 1)
    if new_attempts >= s.OTP_LOCKOUT_FAIL_THRESHOLD:
        await redis.hdel(key, "hash", "otp_expires_at")
    return False


# --------------------------------------------------------------------------
# OTP delivery placeholders — replace with real providers later
# --------------------------------------------------------------------------

async def send_otp_email(email: str, otp: str) -> None:
    # TODO: wire later. Dev: print so it always shows in uvicorn stdout.
    print(f"[DEV] otp.email to={email} otp={otp}", flush=True)


async def send_otp_mobile(mobile: str, otp: str) -> None:
    # TODO: wire later. Dev: print so it always shows in uvicorn stdout.
    print(f"[DEV] otp.mobile to={mobile} otp={otp}", flush=True)


# --------------------------------------------------------------------------
# Request / cookie / token-pair helpers
# --------------------------------------------------------------------------

def get_client_ip(request: Request) -> str | None:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else None


def get_client_ua(request: Request) -> str:
    return request.headers.get("user-agent", "")[:200]


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    s = get_settings()
    httponly_common = {
        "httponly": True,
        "secure": s.COOKIE_SECURE,
        "samesite": s.COOKIE_SAMESITE,
        "domain": s.COOKIE_DOMAIN,
        "path": "/",
    }
    response.set_cookie(
        s.ACCESS_COOKIE_NAME, access,
        max_age=s.ACCESS_TOKEN_TTL_MINUTES * 60, **httponly_common,
    )
    response.set_cookie(
        s.REFRESH_COOKIE_NAME, refresh,
        max_age=s.REFRESH_TOKEN_TTL_DAYS * 86400, **httponly_common,
    )
    csrf = secrets.token_urlsafe(32)
    response.set_cookie(
        s.CSRF_COOKIE_NAME, csrf,
        max_age=s.REFRESH_TOKEN_TTL_DAYS * 86400,
        httponly=False,
        secure=s.COOKIE_SECURE,
        samesite=s.COOKIE_SAMESITE,
        domain=s.COOKIE_DOMAIN,
        path="/",
    )


def set_access_cookie(response: Response, access: str) -> None:
    s = get_settings()
    response.set_cookie(
        s.ACCESS_COOKIE_NAME, access,
        httponly=True,
        secure=s.COOKIE_SECURE,
        samesite=s.COOKIE_SAMESITE,
        domain=s.COOKIE_DOMAIN,
        path="/",
        max_age=s.ACCESS_TOKEN_TTL_MINUTES * 60,
    )


def clear_auth_cookies(response: Response) -> None:
    s = get_settings()
    response.delete_cookie(s.ACCESS_COOKIE_NAME, path="/", domain=s.COOKIE_DOMAIN)
    response.delete_cookie(s.REFRESH_COOKIE_NAME, path="/", domain=s.COOKIE_DOMAIN)
    response.delete_cookie(s.CSRF_COOKIE_NAME, path="/", domain=s.COOKIE_DOMAIN)


async def issue_token_pair(
    redis: Any, user: dict[str, Any], ip: str | None, ua: str | None,
) -> tuple[str, str]:
    user_id = str(user["_id"])
    refresh, family_id = await issue_refresh_token(redis, user_id, ip=ip, ua=ua)
    access, _, _ = create_access_token(user, family_id)
    return access, refresh


def token_payload(access: str) -> dict[str, str]:
    return {"access_token": access, "token_type": "bearer"}


def read_refresh_cookie(request: Request) -> str:
    settings = get_settings()
    token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not token:
        header = request.headers.get("x-refresh-token", "").strip()
        if header:
            return header
        raise HTTPException(status_code=401, detail="Missing refresh token.")
    return token


# --------------------------------------------------------------------------
# User state mutations + guards
# --------------------------------------------------------------------------

async def record_login_in_users(
    mongo: AsyncIOMotorDatabase, user_id: str, *, ip: str | None, ua: str = "",
) -> None:
    if not ObjectId.is_valid(user_id):
        return
    now = datetime.now(timezone.utc)
    await mongo["users"].update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "auth.last_login": now,
                "auth.login_info.date": now,
                "auth.login_info.ip_address": ip,
                "auth.login_info.browser": detect_browser(ua),
                "auth.login_info.device": detect_device(ua),
                "auth.login_info.device_type": detect_device_type(ua),
                "updated_at": now,
            },
            "$inc": {"auth.login_count": 1},
        },
    )


async def block_existing_user_if_locked(
    mongo: AsyncIOMotorDatabase,
    redis: Any,
    ident_type: str,
    identifier: str,
    *,
    user: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """Block existing user in Mongo if Redis lockout triggered. Returns the user (or None)."""
    if not await is_otp_locked(redis, identifier):
        return user
    if user is None:
        user = await mongo["users"].find_one(
            mongo_query_for_identifier(ident_type, identifier),
            projection={"_id": 1, "blocked": 1},
        )
    if user is None or user.get("blocked"):
        return user
    await mongo["users"].update_one(
        {"_id": user["_id"]},
        {
            "$set": {"blocked": True, "updated_at": datetime.now(timezone.utc)},
            "$inc": {"auth.blocked_count": 1},
        },
    )
    user["blocked"] = True
    return user


async def assert_channel_pending(user: dict[str, Any], ident_type: str) -> None:
    if ident_type == "email" and user.get("email_verified"):
        raise HTTPException(status_code=400, detail="Email already verified.")
    if ident_type == "mobile" and user.get("mobile_number_verified"):
        raise HTTPException(status_code=400, detail="Mobile already verified.")


async def assert_no_collision(
    users, ident_type: str, identifier: str, exclude_user_id: ObjectId,
) -> None:
    field = "email" if ident_type == "email" else "mobile_number"
    clash = await users.find_one(
        {field: identifier, "_id": {"$ne": exclude_user_id}},
        projection={"_id": 1},
    )
    if clash is not None:
        raise HTTPException(status_code=409, detail=f"{field}: already registered.")


async def build_new_user_doc(
    *,
    email: str | None,
    mobile: str | None,
    email_verified: bool,
    mobile_verified: bool,
    oauth_account: dict[str, Any] | None,
    referred_by: str | None,
    ip: str | None,
    ua: str,
    mongo: AsyncIOMotorDatabase,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    referral_code = await generate_unique_referral_code(mongo)
    return {
        "role": "user",
        "email": email,
        "mobile_number": mobile,
        "password": None,
        "email_verified": email_verified,
        "mobile_number_verified": mobile_verified,
        "twofa_enabled": False,
        "profile": None,
        "referral_code": referral_code,
        "referred_by": referred_by,
        "status": "pending",
        "blocked": False,
        "auth": {
            "last_login": now,
            "login_count": 1,
            "blocked_count": 0,
            "login_info": {
                "date": now,
                "browser": detect_browser(ua),
                "device": detect_device(ua),
                "device_type": detect_device_type(ua),
                "ip_address": ip,
            },
            "passkey_credentials": [],
        },
        "oauth_accounts": [oauth_account] if oauth_account else [],
        "meta": {},
        "created_at": now,
        "updated_at": now,
    }


async def link_google_account(
    users, user: dict[str, Any], provider_user_id: str, email: str | None,
) -> None:
    has_link = any(
        a.get("provider") == "google" and a.get("provider_user_id") == provider_user_id
        for a in (user.get("oauth_accounts") or [])
    )
    now = datetime.now(timezone.utc)
    ops: dict[str, Any] = {"$set": {"updated_at": now, "auth.last_login": now}}
    if not has_link:
        ops["$push"] = {"oauth_accounts": {
            "provider": "google",
            "provider_user_id": provider_user_id,
            "email": email,
            "linked_at": now,
        }}
    await users.update_one({"_id": user["_id"]}, ops)
