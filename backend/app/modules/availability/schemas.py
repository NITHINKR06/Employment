"""Availability request schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class GenerateSlotsRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    start_date: date
    end_date: date
    slot_duration_minutes: int = Field(default=60, gt=0, le=480)
