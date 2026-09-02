"""Bookings Pydantic schemas — port of booking.schema.js."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CreateBookingRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    professional_id: str = Field(min_length=1)
    service_id: str | None = None
    slot_id: str | None = None
    scheduled_at: datetime | None = None
    address: str = Field(min_length=1)
    notes: str | None = None


class UpdateBookingStatusRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    status: str = Field(
        pattern=r"^(PENDING|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED)$"
    )
