from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, Path, Request, status

from app.api.endpoints.billing import controllers
from app.api.endpoints.billing.models import (
    ConfirmRequest,
    QuoteRequest,
    ReferralRequest,
)
from app.database import MongoDatabase, RedisClient
from app.razorpay import RazorpayClient, get_razorpay
from app.responses import ok_response
from app.trade_hub import TradeHub
from app.utils.utils import CurrentClaims, rate_limit

router = APIRouter(prefix="/billing", tags=["Billing"])

Razorpay = Annotated[RazorpayClient, Depends(get_razorpay)]
SubscriptionId = Path(..., pattern=r"^[a-f0-9]{24}$")


@router.get("/plans", status_code=status.HTTP_200_OK)
async def plans(claims: CurrentClaims, mongo: MongoDatabase):
    data = await controllers.list_plans(mongo)
    return ok_response("Plans fetched.", data=data)


@router.get("/entitlements", status_code=status.HTTP_200_OK)
async def entitlements(claims: CurrentClaims, mongo: MongoDatabase, redis: RedisClient):
    data = await controllers.get_entitlements(mongo, redis, claims)
    return ok_response("Entitlements fetched.", data=data)


@router.get("/subscriptions", status_code=status.HTTP_200_OK)
async def overview(claims: CurrentClaims, mongo: MongoDatabase):
    data = await controllers.overview(mongo, claims)
    return ok_response("Subscriptions fetched.", data=data)


@router.get("/subscriptions/{subscription_id}", status_code=status.HTTP_200_OK)
async def subscription(claims: CurrentClaims, mongo: MongoDatabase, subscription_id: str = SubscriptionId):
    data = await controllers.subscription_status(mongo, claims, subscription_id)
    return ok_response("Subscription fetched.", data=data)


@router.post("/subscriptions/{subscription_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel(
    claims: CurrentClaims, mongo: MongoDatabase, redis: RedisClient, rz: Razorpay,
    subscription_id: str = SubscriptionId,
):
    data = await controllers.cancel(mongo, redis, rz, claims, subscription_id)
    return ok_response("Autopay cancelled.", data=data)


@router.post("/quote", status_code=status.HTTP_200_OK)
async def quote(body: QuoteRequest, claims: CurrentClaims, mongo: MongoDatabase, trade: TradeHub):
    data = await controllers.quote(mongo, trade, claims, body)
    return ok_response("Quote ready.", data=data)


@router.post("/checkout", status_code=status.HTTP_200_OK, dependencies=[Depends(rate_limit(20, 60))])
async def checkout(
    body: QuoteRequest, claims: CurrentClaims, mongo: MongoDatabase, redis: RedisClient, rz: Razorpay, trade: TradeHub,
):
    data = await controllers.checkout(mongo, redis, rz, trade, claims, body)
    return ok_response("Checkout ready.", data=data)


@router.post("/confirm", status_code=status.HTTP_200_OK)
async def confirm(body: ConfirmRequest, claims: CurrentClaims, mongo: MongoDatabase, redis: RedisClient, rz: Razorpay):
    data = await controllers.confirm(mongo, redis, rz, claims, body)
    return ok_response("Payment received.", data=data)


@router.get("/referral", status_code=status.HTTP_200_OK)
async def referral(claims: CurrentClaims, mongo: MongoDatabase):
    data = await controllers.referral(mongo, claims)
    return ok_response("Referral fetched.", data=data)


@router.post("/referral", status_code=status.HTTP_200_OK, dependencies=[Depends(rate_limit(10, 60))])
async def apply_referral(body: ReferralRequest, claims: CurrentClaims, mongo: MongoDatabase):
    data = await controllers.apply_referral(mongo, claims, body.code)
    return ok_response("Referral code applied.", data=data)


@router.post("/webhook/razorpay", status_code=status.HTTP_200_OK, include_in_schema=False)
async def razorpay_webhook(
    request: Request,
    mongo: MongoDatabase,
    redis: RedisClient,
    rz: Razorpay,
    signature: str = Header("", alias="x-razorpay-signature"),
    event_id: str = Header("", alias="x-razorpay-event-id"),
):
    await controllers.webhook(mongo, redis, rz, await request.body(), signature, event_id)
    return ok_response("Received.")
