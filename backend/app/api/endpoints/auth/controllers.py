from __future__ import annotations

import logging
import secrets
from typing import Any

from bson import ObjectId
from fastapi import HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis
from webauthn.helpers.exceptions import WebAuthnException

from app.api.endpoints.auth.models import (
    AuthRequest,
    GoogleAuthRequest,
    PasskeyAuthCompleteRequest,
    PasskeyRegisterCompleteRequest,
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
    generate_unique_username,
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
    build_passkey_authentication_options,
    build_passkey_registration_options,
    passkey_auth_challenge_key,
    passkey_reg_challenge_key,
    verify_passkey_authentication,
    verify_passkey_registration,
)
from app.utils.utils import now_utc

logger = logging.getLogger("svakosh.auth.controller")

PASSKEY_CHALLENGE_TTL_SECONDS = 120

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
    set_fields: dict[str, Any] = {field: identifier, verified_field: True, "updated_at": now_utc()}

    email_ok = ident_type == "email" or bool(user.get("email_verified"))
    mobile_ok = ident_type == "mobile" or bool(user.get("mobile_number_verified"))
    if email_ok and mobile_ok and user.get("status") != "active":
        set_fields["status"] = "active"

    if ident_type == "email":
        profile = user.get("profile") or {}
        if not profile.get("username"):
            username = await generate_unique_username(mongo, identifier)
            if username:
                if user.get("profile"):
                    set_fields["profile.username"] = username
                else:
                    set_fields["profile"] = {"username": username}

    await users.update_one({"_id": user_id}, {"$set": set_fields})
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
        profile_seed: dict[str, Any] = {}
        if claims.get("name"):
            profile_seed["full_name"] = claims["name"]
        if claims.get("picture"):
            profile_seed["avatar"] = claims["picture"]
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
            profile=profile_seed or None,
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
# Passkeys (WebAuthn)
# --------------------------------------------------------------------------

def _passkey_credentials(user: dict[str, Any]) -> list[dict[str, Any]]:
    return (user.get("auth") or {}).get("passkey_credentials") or []


async def passkey_register_begin(
    claims: Any, *, mongo: AsyncIOMotorDatabase, redis: Redis,
) -> dict[str, Any]:
    users = mongo["users"]
    user = await users.find_one({"_id": ObjectId(claims.user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    user_name = user.get("email") or user.get("mobile_number") or claims.user_id
    display_name = (user.get("profile") or {}).get("full_name") or user_name
    options, challenge = build_passkey_registration_options(
        claims.user_id, user_name, display_name, _passkey_credentials(user),
    )
    await redis.set(
        passkey_reg_challenge_key(claims.user_id),
        challenge,
        ex=PASSKEY_CHALLENGE_TTL_SECONDS,
    )
    return options


async def passkey_register_complete(
    body: PasskeyRegisterCompleteRequest, claims: Any, *,
    mongo: AsyncIOMotorDatabase, redis: Redis,
) -> dict[str, Any]:
    key = passkey_reg_challenge_key(claims.user_id)
    challenge = await redis.get(key)
    if not challenge:
        raise HTTPException(status_code=400, detail="Passkey challenge expired. Try again.")
    await redis.delete(key)

    try:
        verified = verify_passkey_registration(body.credential, challenge)
    except WebAuthnException as e:
        logger.warning("passkey register verify failed user=%s err=%s", claims.user_id, e)
        raise HTTPException(status_code=400, detail="Passkey registration failed.") from e

    now = now_utc()
    transports = (body.credential.get("response") or {}).get("transports") or []
    new_cred = {
        "credential_id": verified["credential_id"],
        "public_key": verified["public_key"],
        "sign_count": verified["sign_count"],
        "transports": transports,
        "aaguid": verified["aaguid"],
        "device_name": body.device_name or "Passkey",
        "created_at": now,
        "last_used_at": None,
    }
    res = await mongo["users"].update_one(
        {
            "_id": ObjectId(claims.user_id),
            "auth.passkey_credentials.credential_id": {"$ne": new_cred["credential_id"]},
        },
        {"$push": {"auth.passkey_credentials": new_cred}, "$set": {"updated_at": now}},
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Passkey already registered.")

    return {
        "credential_id": new_cred["credential_id"],
        "device_name": new_cred["device_name"],
        "created_at": new_cred["created_at"],
    }


async def passkey_auth_begin(*, redis: Redis) -> dict[str, Any]:
    options, challenge = build_passkey_authentication_options()
    challenge_id = secrets.token_urlsafe(24)
    await redis.set(
        passkey_auth_challenge_key(challenge_id),
        challenge,
        ex=PASSKEY_CHALLENGE_TTL_SECONDS,
    )
    return {"challenge_id": challenge_id, "options": options}


async def passkey_auth_complete(
    body: PasskeyAuthCompleteRequest, *,
    mongo: AsyncIOMotorDatabase, redis: Redis, request: Request, response: Response,
) -> dict[str, Any]:
    key = passkey_auth_challenge_key(body.challenge_id)
    challenge = await redis.get(key)
    if not challenge:
        raise HTTPException(status_code=400, detail="Passkey challenge expired. Try again.")
    await redis.delete(key)

    credential_id = body.credential.get("id") or body.credential.get("rawId")
    if not credential_id:
        raise HTTPException(status_code=400, detail="Invalid passkey response.")

    users = mongo["users"]
    user = await users.find_one({"auth.passkey_credentials.credential_id": credential_id})
    if user is None:
        raise HTTPException(status_code=401, detail="Passkey not recognized.")
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    stored = next(
        (c for c in _passkey_credentials(user) if c.get("credential_id") == credential_id),
        None,
    )
    if stored is None:
        raise HTTPException(status_code=401, detail="Passkey not recognized.")

    try:
        new_sign_count = verify_passkey_authentication(
            body.credential, challenge, stored["public_key"], stored.get("sign_count", 0),
        )
    except WebAuthnException as e:
        logger.warning("passkey auth verify failed cred=%s err=%s", credential_id, e)
        raise HTTPException(status_code=401, detail="Passkey verification failed.") from e

    ip = get_client_ip(request)
    ua = get_client_ua(request)
    now = now_utc()
    await users.update_one(
        {"_id": user["_id"], "auth.passkey_credentials.credential_id": credential_id},
        {"$set": {
            "auth.passkey_credentials.$.sign_count": new_sign_count,
            "auth.passkey_credentials.$.last_used_at": now,
            "updated_at": now,
        }},
    )
    await record_login_in_users(mongo, str(user["_id"]), ip=ip, ua=ua)
    user = await users.find_one({"_id": user["_id"]})
    if user is None:
        raise HTTPException(status_code=500, detail="User lookup failed after passkey auth.")

    access, refresh = await issue_token_pair(redis, user, ip, ua)
    set_auth_cookies(response, access, refresh)
    return {
        "user_id": str(user["_id"]),
        "is_new_user": False,
        "tokens": token_payload(access),
    }


async def passkey_list(claims: Any, *, mongo: AsyncIOMotorDatabase) -> list[dict[str, Any]]:
    user = await mongo["users"].find_one(
        {"_id": ObjectId(claims.user_id)},
        projection={"auth.passkey_credentials": 1},
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return [
        {
            "credential_id": c["credential_id"],
            "device_name": c.get("device_name"),
            "created_at": c.get("created_at"),
            "last_used_at": c.get("last_used_at"),
        }
        for c in _passkey_credentials(user)
    ]


async def passkey_remove(
    claims: Any, credential_id: str, *, mongo: AsyncIOMotorDatabase,
) -> dict[str, Any]:
    res = await mongo["users"].update_one(
        {"_id": ObjectId(claims.user_id)},
        {
            "$pull": {"auth.passkey_credentials": {"credential_id": credential_id}},
            "$set": {"updated_at": now_utc()},
        },
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Passkey not found.")
    return {"removed": credential_id}


async def passkey_remove_all(claims: Any, *, mongo: AsyncIOMotorDatabase) -> dict[str, Any]:
    await mongo["users"].update_one(
        {"_id": ObjectId(claims.user_id)},
        {"$set": {"auth.passkey_credentials": [], "updated_at": now_utc()}},
    )
    return {"removed_all": True}


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

_ME_PROJECTION = {
    "email": 1,
    "mobile_number": 1,
    "email_verified": 1,
    "mobile_number_verified": 1,
    "status": 1,
    "role": 1,
    "profile.full_name": 1,
    "profile.username": 1,
    "profile.avatar": 1,
}


async def get_me(
    claims: AccessClaims, *, mongo: AsyncIOMotorDatabase,
) -> dict[str, Any]:
    if not ObjectId.is_valid(claims.user_id):
        raise HTTPException(status_code=404, detail="User not found.")
    user = await mongo["users"].find_one(
        {"_id": ObjectId(claims.user_id)},
        projection=_ME_PROJECTION,
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    p = user.get("profile") or {}
    return {
        "id": str(user["_id"]),
        "email": user.get("email"),
        "mobile_number": user.get("mobile_number"),
        "email_verified": bool(user.get("email_verified", False)),
        "mobile_number_verified": bool(user.get("mobile_number_verified", False)),
        "status": user.get("status"),
        "role": user.get("role"),
        "profile": {
            "full_name": p.get("full_name"),
            "username": p.get("username"),
            "avatar": p.get("avatar"),
        },
    }


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
