from __future__ import annotations

from typing import Any

from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.api.endpoints.auth.utils import (
    AccessClaims,
    build_blocked_detail,
    build_otp_error_detail,
    check_otp,
    generate_otp,
    get_otp_status,
    is_otp_locked,
    is_user_blocked,
    save_otp,
    send_otp_whatsapp,
)
from app.api.endpoints.profile.models import (
    UpdateProfileRequest,
    WhatsappSendOtpRequest,
    WhatsappVerifyRequest,
)
from app.utils.utils import (
    DecryptionError,
    date_to_ddmmyyyy,
    decrypt,
    dob_to_iso,
    encrypt,
    mask_pan,
    now_utc,
)

_PROFILE_PROJECTION = {
    "email": 1,
    "mobile_number": 1,
    "status": 1,
    "role": 1,
    "referral_code": 1,
    "referred_by": 1,
    "created_at": 1,
    "profile": 1,
}


def _pan_masked(encrypted: str | None) -> str | None:
    if not encrypted:
        return None
    try:
        return mask_pan(decrypt(encrypted))
    except DecryptionError:
        return None


def serialize_profile(user: dict[str, Any]) -> dict[str, Any]:
    p = user.get("profile") or {}
    return {
        "email": user.get("email"),
        "mobile_number": user.get("mobile_number"),
        "status": user.get("status"),
        "role": user.get("role"),
        "referral_code": user.get("referral_code"),
        "referred_by": user.get("referred_by"),
        "created_at": user.get("created_at"),
        "profile": {
            "full_name": p.get("full_name"),
            "username": p.get("username"),
            "avatar": p.get("avatar"),
            "gender": p.get("gender"),
            "dob": dob_to_iso(p.get("dob")),
            "occupation": p.get("occupation"),
            "pan_number": _pan_masked(p.get("pan_number")),
            "whatsapp_number": p.get("whatsapp_number"),
            "whatsapp_number_verified": bool(p.get("whatsapp_number_verified", False)),
            "address": p.get("address"),
        },
    }


async def get_profile(
    claims: AccessClaims, *, mongo: AsyncIOMotorDatabase,
) -> dict[str, Any]:
    if not ObjectId.is_valid(claims.user_id):
        raise HTTPException(status_code=404, detail="User not found.")
    user = await mongo["users"].find_one(
        {"_id": ObjectId(claims.user_id)},
        projection=_PROFILE_PROJECTION,
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return serialize_profile(user)


async def update_profile(
    claims: AccessClaims, *, mongo: AsyncIOMotorDatabase, body: UpdateProfileRequest,
) -> dict[str, Any]:
    if not ObjectId.is_valid(claims.user_id):
        raise HTTPException(status_code=404, detail="User not found.")
    user_id = ObjectId(claims.user_id)

    users = mongo["users"]
    current = await users.find_one({"_id": user_id}, projection={"profile": 1})
    if current is None:
        raise HTTPException(status_code=404, detail="User not found.")

    profile: dict[str, Any] = dict(current.get("profile") or {})
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update.")

    for key, value in changes.items():
        if key == "pan_number":
            profile["pan_number"] = encrypt(value) if value else None
        elif key == "dob":
            profile["dob"] = date_to_ddmmyyyy(value) if value else None
        else:
            profile[key] = value

    await users.update_one(
        {"_id": user_id},
        {"$set": {"profile": profile, "updated_at": now_utc()}},
    )
    return await get_profile(claims, mongo=mongo)


def _whatsapp_otp_id(number: str) -> str:
    return f"wa:{number}"


async def whatsapp_send_otp(
    body: WhatsappSendOtpRequest, claims: AccessClaims, *,
    mongo: AsyncIOMotorDatabase, redis: Redis,
) -> dict[str, Any]:
    if not ObjectId.is_valid(claims.user_id):
        raise HTTPException(status_code=404, detail="User not found.")
    user = await mongo["users"].find_one(
        {"_id": ObjectId(claims.user_id)}, projection={"blocked": 1},
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    otp_id = _whatsapp_otp_id(body.whatsapp_number)
    if await is_otp_locked(redis, otp_id):
        raise HTTPException(
            status_code=429, detail="Too many wrong OTP attempts. Try again later.",
        )

    otp = generate_otp()
    await save_otp(redis, otp_id, otp)
    await send_otp_whatsapp(body.whatsapp_number, otp)
    return {"whatsapp_number": body.whatsapp_number}


async def whatsapp_verify(
    body: WhatsappVerifyRequest, claims: AccessClaims, *,
    mongo: AsyncIOMotorDatabase, redis: Redis,
) -> dict[str, Any]:
    if not ObjectId.is_valid(claims.user_id):
        raise HTTPException(status_code=404, detail="User not found.")
    user_id = ObjectId(claims.user_id)

    users = mongo["users"]
    user = await users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if is_user_blocked(user):
        raise HTTPException(status_code=403, detail=build_blocked_detail())

    otp_id = _whatsapp_otp_id(body.whatsapp_number)
    if not await check_otp(redis, otp_id, body.otp):
        status = await get_otp_status(redis, otp_id)
        raise HTTPException(status_code=400, detail=build_otp_error_detail(
            status, is_new_user=False, is_blocked=False,
        ))

    profile: dict[str, Any] = dict(user.get("profile") or {})
    profile["whatsapp_number"] = body.whatsapp_number
    profile["whatsapp_number_verified"] = True
    await users.update_one(
        {"_id": user_id},
        {"$set": {"profile": profile, "updated_at": now_utc()}},
    )
    return await get_profile(claims, mongo=mongo)
