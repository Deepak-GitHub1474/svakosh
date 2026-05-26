from __future__ import annotations

import logging
from typing import Any

from bson import ObjectId
from fastapi import HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.api.endpoints.auth.models import (
    AuthRequest,
    GoogleAuthRequest,
    VerifyOtpRequest,
)
from app.api.endpoints.auth.utils import (
    AccessClaims,
    OAuthError,
    TokenInvalidError,
    TokenReusedError,
    assert_channel_pending,
    assert_no_collision,
    block_existing_user_if_locked,
    build_blocked_detail,
    build_new_user_doc,
    build_otp_error_detail,
    check_otp,
    clear_auth_cookies,
    create_access_token,
    detect_identifier,
    generate_otp,
    get_client_ip,
    get_client_ua,
    get_otp_status,
    is_otp_locked,
    is_user_blocked,
    issue_token_pair,
    link_google_account,
    list_user_sessions,
    mongo_query_for_identifier,
    read_refresh_cookie,
    record_login_in_users,
    revoke_access_token,
    revoke_family,
    rotate_refresh_token,
    save_otp,
    send_otp_email,
    send_otp_mobile,
    set_access_cookie,
    set_auth_cookies,
    token_payload,
    user_sessions_key,
    verify_google_id_token,
)
from app.utils.utils import now_utc

logger = logging.getLogger("svakosh.auth.controller")


# --------------------------------------------------------------------------
# Unified OTP send / verify  (signin or signup)
# --------------------------------------------------------------------------

async def send_otp(
    body: AuthRequest, *, mongo: AsyncIOMotorDatabase, redis: Redis,
) -> dict[str, Any]:
    ident_type = detect_identifier(body.identifier)
    identifier = body.identifier

    user = await mongo["users"].find_one(
        mongo_query_for_identifier(ident_type, identifier),
        projection={"_id": 1, "blocked": 1},
    )
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())
    if await is_otp_locked(redis, identifier):
        raise HTTPException(
            status_code=429,
            detail="Too many wrong OTP attempts. Try again later.",
        )

    otp = generate_otp()
    await save_otp(redis, identifier, otp)
    if ident_type == "email":
        await send_otp_email(identifier, otp)
    else:
        await send_otp_mobile(identifier, otp)

    return {
        "identifier": identifier,
        "identifier_type": ident_type,
        "is_new_user": user is None,
    }


async def verify_otp(
    body: VerifyOtpRequest,
    *,
    mongo: AsyncIOMotorDatabase,
    redis: Redis,
    request: Request,
    response: Response,
) -> dict[str, Any]:
    ident_type = detect_identifier(body.identifier)
    identifier = body.identifier

    users = mongo["users"]

    user = await users.find_one(mongo_query_for_identifier(ident_type, identifier))
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    if not await check_otp(redis, identifier, body.otp):
        existing = await block_existing_user_if_locked(mongo, redis, ident_type, identifier, user=user)
        status = await get_otp_status(redis, identifier)
        raise HTTPException(status_code=400, detail=build_otp_error_detail(
            status,
            is_new_user=user is None,
            is_blocked=is_user_blocked(existing),
        ))

    is_new_user = user is None
    ip = get_client_ip(request)
    ua = get_client_ua(request)

    if is_new_user:
        doc = await build_new_user_doc(
            email=identifier if ident_type == "email" else None,
            mobile=identifier if ident_type == "mobile" else None,
            email_verified=(ident_type == "email"),
            mobile_verified=(ident_type == "mobile"),
            oauth_account=None,
            referred_by=body.referred_by,
            ip=ip,
            ua=ua,
            mongo=mongo,
        )
        result = await users.insert_one(doc)
        user = await users.find_one({"_id": result.inserted_id})
    else:
        assert user is not None
        await record_login_in_users(mongo, str(user["_id"]), ip=ip, ua=ua)
        user = await users.find_one({"_id": user["_id"]})

    if user is None:
        raise HTTPException(status_code=500, detail="User lookup failed after upsert.")

    access, refresh = await issue_token_pair(redis, user, ip, ua)
    set_auth_cookies(response, access, refresh)

    return {
        "user_id": str(user["_id"]),
        "is_new_user": is_new_user,
        "tokens": token_payload(access),
    }


# --------------------------------------------------------------------------
# Pending-channel add (authenticated)
# --------------------------------------------------------------------------

async def add_channel_send_otp(
    body: AuthRequest, claims: AccessClaims, *, mongo: AsyncIOMotorDatabase, redis: Redis,
) -> dict[str, Any]:
    ident_type = detect_identifier(body.identifier)
    identifier = body.identifier
    user_id = ObjectId(claims.user_id)

    users = mongo["users"]
    user = await users.find_one(
        {"_id": user_id},
        projection={"email_verified": 1, "mobile_number_verified": 1, "blocked": 1},
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    await assert_channel_pending(user, ident_type)
    await assert_no_collision(users, ident_type, identifier, user_id)
    if await is_otp_locked(redis, identifier):
        raise HTTPException(
            status_code=429,
            detail="Too many wrong OTP attempts. Try again later.",
        )

    otp = generate_otp()
    await save_otp(redis, identifier, otp)
    if ident_type == "email":
        await send_otp_email(identifier, otp)
    else:
        await send_otp_mobile(identifier, otp)

    return {"identifier": identifier, "identifier_type": ident_type}


async def add_channel_verify(
    body: VerifyOtpRequest,
    claims: AccessClaims,
    *,
    mongo: AsyncIOMotorDatabase,
    redis: Redis,
    response: Response,
) -> dict[str, Any]:
    ident_type = detect_identifier(body.identifier)
    identifier = body.identifier
    user_id = ObjectId(claims.user_id)

    users = mongo["users"]
    user = await users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    await assert_channel_pending(user, ident_type)

    if not await check_otp(redis, identifier, body.otp):
        status = await get_otp_status(redis, identifier)
        raise HTTPException(status_code=400, detail=build_otp_error_detail(
            status,
            is_new_user=False,
            is_blocked=False,
        ))

    await assert_no_collision(users, ident_type, identifier, user_id)

    field = "email" if ident_type == "email" else "mobile_number"
    verified_field = "email_verified" if ident_type == "email" else "mobile_number_verified"
    await users.update_one(
        {"_id": user_id},
        {"$set": {field: identifier, verified_field: True, "updated_at": now_utc()}},
    )
    user = await users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=500, detail="User lookup failed after channel add.")

    new_access, _, _ = create_access_token(user, claims.family_id)
    set_access_cookie(response, new_access)

    return {
        "channel": ident_type,
        "identifier": identifier,
        "access_token": new_access,
    }


# --------------------------------------------------------------------------
# Google (signin or signup — single endpoint)
# --------------------------------------------------------------------------

async def google_auth(
    body: GoogleAuthRequest,
    *,
    mongo: AsyncIOMotorDatabase,
    redis: Redis,
    request: Request,
    response: Response,
) -> dict[str, Any]:
    try:
        claims = await verify_google_id_token(body.id_token)
    except OAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e

    email = (claims.get("email") or "").strip().lower() or None
    provider_user_id = claims["provider_user_id"]
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email.")

    users = mongo["users"]
    user = await users.find_one({
        "oauth_accounts": {
            "$elemMatch": {"provider": "google", "provider_user_id": provider_user_id},
        }
    }) or await users.find_one({"email": email})

    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    ip = get_client_ip(request)
    ua = get_client_ua(request)

    is_new_user = user is None
    if is_new_user:
        doc = await build_new_user_doc(
            email=email,
            mobile=None,
            email_verified=True,
            mobile_verified=False,
            oauth_account={
                "provider": "google",
                "provider_user_id": provider_user_id,
                "email": email,
                "linked_at": now_utc(),
            },
            referred_by=body.referred_by,
            ip=ip,
            ua=ua,
            mongo=mongo,
        )
        result = await users.insert_one(doc)
        user = await users.find_one({"_id": result.inserted_id})
    else:
        assert user is not None
        await link_google_account(users, user, provider_user_id, email)
        await record_login_in_users(mongo, str(user["_id"]), ip=ip, ua=ua)
        user = await users.find_one({"_id": user["_id"]})

    if user is None:
        raise HTTPException(status_code=500, detail="User lookup failed after upsert.")

    access, refresh = await issue_token_pair(redis, user, ip, ua)
    set_auth_cookies(response, access, refresh)

    return {
        "user_id": str(user["_id"]),
        "is_new_user": is_new_user,
        "tokens": token_payload(access),
    }


# --------------------------------------------------------------------------
# Refresh / Logout
# --------------------------------------------------------------------------

async def refresh_tokens(
    *,
    mongo: AsyncIOMotorDatabase,
    redis: Redis,
    request: Request,
    response: Response,
) -> dict[str, Any]:
    presented = read_refresh_cookie(request)
    ip = get_client_ip(request)
    ua = get_client_ua(request)
    try:
        new_rt, family_id, user_id = await rotate_refresh_token(redis, presented, ip=ip, ua=ua)
    except TokenReusedError as e:
        clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail=str(e)) from e
    except TokenInvalidError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e

    user = await mongo["users"].find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists.")
    access, _, _ = create_access_token(user, family_id)
    set_auth_cookies(response, access, new_rt)
    return {
        "user_id": user_id,
        "tokens": token_payload(access),
    }


async def logout(
    claims: AccessClaims, *, redis: Redis, response: Response,
) -> dict[str, Any]:
    await revoke_access_token(redis, claims.jti, claims.exp)
    if claims.family_id:
        await revoke_family(redis, claims.family_id)
    clear_auth_cookies(response)
    return {"message": "Logged out."}


# --------------------------------------------------------------------------
# /me
# --------------------------------------------------------------------------

async def get_me(
    claims: AccessClaims, *, mongo: AsyncIOMotorDatabase,
) -> dict[str, Any]:
    if not ObjectId.is_valid(claims.user_id):
        raise HTTPException(status_code=404, detail="User not found.")
    user = await mongo["users"].find_one(
        {"_id": ObjectId(claims.user_id)},
        projection={"password": 0},
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    user["_id"] = str(user["_id"])
    return user


# --------------------------------------------------------------------------
# Sessions
# --------------------------------------------------------------------------

async def list_sessions(claims: AccessClaims, *, redis: Redis) -> list[dict[str, Any]]:
    return await list_user_sessions(redis, claims.user_id, current_family_id=claims.family_id)


async def revoke_one_session(
    claims: AccessClaims, session_id: str, *, redis: Any, response: Response,
) -> dict[str, Any]:
    user_family_ids = await redis.smembers(user_sessions_key(claims.user_id))
    if session_id not in user_family_ids:
        raise HTTPException(status_code=404, detail="Session not found.")
    await revoke_family(redis, session_id)
    if session_id == claims.family_id:
        await revoke_access_token(redis, claims.jti, claims.exp)
        clear_auth_cookies(response)
    return {"message": "Session revoked.", "session_id": session_id}


async def revoke_all_other_sessions(
    claims: AccessClaims, *, redis: Redis,
) -> dict[str, Any]:
    sessions = await list_user_sessions(redis, claims.user_id, current_family_id=claims.family_id)
    revoked = 0
    for s in sessions:
        if s["session_id"] != claims.family_id:
            await revoke_family(redis, s["session_id"])
            revoked += 1
    return {"message": f"{revoked} sessions revoked.", "revoked_count": revoked}
