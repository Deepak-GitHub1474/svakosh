from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.endpoints.profile import controllers
from app.api.endpoints.profile.models import (
    UpdateProfileRequest,
    WhatsappSendOtpRequest,
    WhatsappVerifyRequest,
)
from app.database import MongoDatabase, RedisClient
from app.responses import ok_response
from app.utils.utils import CurrentClaims, csrf_protect, rate_limit

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", status_code=status.HTTP_200_OK)
async def get_profile(claims: CurrentClaims, mongo: MongoDatabase):
    data = await controllers.get_profile(claims, mongo=mongo)
    return ok_response("Profile fetched.", data=data)


@router.patch(
    "",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(csrf_protect)],
)
async def update_profile(
    body: UpdateProfileRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
):
    data = await controllers.update_profile(claims, mongo=mongo, body=body)
    return ok_response("Profile updated.", data=data)


@router.post(
    "/whatsapp/send-otp",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit(5, 60)), Depends(csrf_protect)],
)
async def whatsapp_send_otp(
    body: WhatsappSendOtpRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
    redis: RedisClient,
):
    data = await controllers.whatsapp_send_otp(body, claims, mongo=mongo, redis=redis)
    return ok_response("OTP sent.", data=data)


@router.post(
    "/whatsapp/verify",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit(10, 60)), Depends(csrf_protect)],
)
async def whatsapp_verify(
    body: WhatsappVerifyRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
    redis: RedisClient,
):
    data = await controllers.whatsapp_verify(body, claims, mongo=mongo, redis=redis)
    return ok_response("WhatsApp number verified.", data=data)
