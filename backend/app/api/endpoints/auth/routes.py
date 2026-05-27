from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response, status

from app.api.endpoints.auth import controllers
from app.api.endpoints.auth.models import (
    AuthRequest,
    GoogleAuthRequest,
    VerifyOtpRequest,
)
from app.database import MongoDatabase, RedisClient
from app.responses import ok_response
from app.utils.utils import CurrentClaims, csrf_protect, rate_limit

router = APIRouter(prefix="/auth", tags=["Auth"])


# --------------------------------------------------------------------------
# Unified signin/signup (single channel)
# --------------------------------------------------------------------------

@router.post(
    "/send-otp",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit(5, 60))],
)
async def send_otp(body: AuthRequest, mongo: MongoDatabase, redis: RedisClient):
    data = await controllers.send_otp(body, mongo=mongo, redis=redis)
    return ok_response("OTP sent.", data=data)


@router.post(
    "/verify-otp",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit(10, 60))],
)
async def verify_otp(
    body: VerifyOtpRequest,
    request: Request,
    response: Response,
    mongo: MongoDatabase,
    redis: RedisClient,
):
    data = await controllers.verify_otp(
        body, mongo=mongo, redis=redis, request=request, response=response,
    )
    msg = "Account created." if data.get("is_new_user") else "Login success."
    return ok_response(msg, data=data)


# --------------------------------------------------------------------------
# Google (single endpoint — signin OR signup)
# --------------------------------------------------------------------------

@router.post(
    "/google",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit(10, 60))],
)
async def google_auth(
    body: GoogleAuthRequest,
    request: Request,
    response: Response,
    mongo: MongoDatabase,
    redis: RedisClient,
):
    data = await controllers.google_auth(
        body, mongo=mongo, redis=redis, request=request, response=response,
    )
    msg = "Account created." if data.get("is_new_user") else "Login success."
    return ok_response(msg, data=data)


# --------------------------------------------------------------------------
# Pending channel add (authenticated)
# --------------------------------------------------------------------------

@router.post(
    "/add-channel/send-otp",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit(5, 60)), Depends(csrf_protect)],
)
async def add_channel_send_otp(
    body: AuthRequest,
    claims: CurrentClaims,
    mongo: MongoDatabase,
    redis: RedisClient,
):
    data = await controllers.add_channel_send_otp(body, claims, mongo=mongo, redis=redis)
    return ok_response("OTP sent.", data=data)


@router.post(
    "/add-channel/verify",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit(10, 60)), Depends(csrf_protect)],
)
async def add_channel_verify(
    body: VerifyOtpRequest,
    claims: CurrentClaims,
    response: Response,
    mongo: MongoDatabase,
    redis: RedisClient,
):
    data = await controllers.add_channel_verify(
        body, claims, mongo=mongo, redis=redis, response=response,
    )
    return ok_response("Channel verified.", data=data)


# --------------------------------------------------------------------------
# Refresh / Logout / Me
# --------------------------------------------------------------------------

@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(csrf_protect)],
)
async def refresh(
    request: Request,
    response: Response,
    mongo: MongoDatabase,
    redis: RedisClient,
):
    data = await controllers.refresh_tokens(
        mongo=mongo, redis=redis, request=request, response=response,
    )
    return ok_response("Tokens refreshed.", data=data)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(csrf_protect)],
)
async def logout(
    claims: CurrentClaims,
    response: Response,
    redis: RedisClient,
):
    data = await controllers.logout(claims, redis=redis, response=response)
    return ok_response("Logged out.", data=data)


@router.get("/me", status_code=status.HTTP_200_OK)
async def me(claims: CurrentClaims, mongo: MongoDatabase):
    data = await controllers.get_me(claims, mongo=mongo)
    return ok_response("Profile fetched.", data=data)


# --------------------------------------------------------------------------
# Sessions
# --------------------------------------------------------------------------

@router.get("/sessions", status_code=status.HTTP_200_OK)
async def list_sessions(claims: CurrentClaims, redis: RedisClient):
    data = await controllers.list_sessions(claims, redis=redis)
    return ok_response("Sessions fetched.", data=data)


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(csrf_protect)],
)
async def revoke_session(
    session_id: str,
    claims: CurrentClaims,
    response: Response,
    redis: RedisClient,
):
    data = await controllers.revoke_one_session(
        claims, session_id, redis=redis, response=response,
    )
    return ok_response("Session revoked.", data=data)


@router.post(
    "/sessions/revoke-others",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(csrf_protect)],
)
async def revoke_other_sessions(claims: CurrentClaims, redis: RedisClient):
    data = await controllers.revoke_all_other_sessions(claims, redis=redis)
    return ok_response("Other sessions revoked.", data=data)
