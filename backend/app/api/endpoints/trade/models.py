from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


def _strip(v: Any) -> Any:
    return v.strip() if isinstance(v, str) else v


TrimStr = Annotated[str, BeforeValidator(_strip)]
Credentials = Annotated[dict[str, str], Field(min_length=1, max_length=10)]


class LinkAccountRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    broker: TrimStr = Field(..., min_length=1, max_length=20)
    account_tag: TrimStr = Field("", max_length=40)
    credentials: Credentials


class UpdateAccountRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_tag: TrimStr | None = Field(None, max_length=40)
    credentials: Credentials | None = None


class SessionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    params: Annotated[dict[str, str], Field(min_length=1, max_length=10)]


class Ticket(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_id: TrimStr = Field("", max_length=24)
    token: TrimStr = Field(..., min_length=5, max_length=80)
    side: Literal["BUY", "SELL"]
    product: Literal["MIS", "CNC", "NRML"]
    type: Literal["MARKET", "LIMIT", "SL", "SL-M"]
    quantity: int = Field(..., gt=0, le=1_000_000)
    price: float = Field(0, ge=0)
    trigger_price: float = Field(0, ge=0)


class PlaceOrderRequest(Ticket):
    client_order_id: TrimStr = Field(..., pattern=r"^[A-Za-z0-9_-]{8,64}$")


class PlaceOrdersRequest(Ticket):
    account_ids: Annotated[
        list[Annotated[str, Field(pattern=r"^[a-f0-9]{24}$")]], Field(min_length=1, max_length=10)
    ]
    client_order_id: TrimStr = Field(..., pattern=r"^[A-Za-z0-9_-]{8,56}$")


class ModifyOrderRequest(Ticket):
    pass
