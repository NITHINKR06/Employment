"""Payments Pydantic schemas — port of payment.schema.js."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CreatePaymentRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    booking_id: str = Field(min_length=1)
    amount: float = Field(gt=0)
    method: str | None = Field(default=None, pattern=r"^(upi|card)$")
