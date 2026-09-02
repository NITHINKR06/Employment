"""Settings request schemas."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class UpdateSettingsRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = Field(default=None, min_length=3, max_length=320)
    phone: str | None = Field(default=None, max_length=64)
    title: str | None = Field(default=None, min_length=1)
    trade: str | None = Field(default=None, min_length=1)
    years_experience: int | None = Field(default=None, ge=0)
    hourly_rate: float | None = Field(default=None, gt=0)
    bio: str | None = None
    experience_summary: str | None = None
    location: str | None = None
    avatar: str | None = None
    availability: str | None = None
