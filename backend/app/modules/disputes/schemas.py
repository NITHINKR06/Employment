"""Disputes request schemas."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CreateDisputeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    booking_id: str = Field(min_length=1)
    subject: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=5000)


class UpdateDisputeStatusRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    status: str = Field(pattern=r"^(OPEN|RESOLVED)$")
    resolution: str | None = Field(default=None, max_length=5000)
