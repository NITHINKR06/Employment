"""Booking lifecycle request schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class RescheduleBookingRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    new_slot_id: str = Field(min_length=1)


class CreateRecurringBookingRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    professional_id: str = Field(min_length=1)
    service_id: str | None = None
    address: str = Field(min_length=1)
    notes: str | None = None
    frequency: str = Field(pattern=r"^(WEEKLY|BIWEEKLY|MONTHLY)$")
    starts_at: datetime
