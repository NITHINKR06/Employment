"""Professionals Pydantic schemas — port of professional.schema.js (zod → pydantic)."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ServiceOfferedSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str = Field(min_length=1)
    subtext: str | None = None
    price: float | None = None


class ListProfessionalsQuery(BaseModel):
    """Query params for GET /professionals."""
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    trade: str | None = None
    search: str | None = None
    min_rate: float | None = Field(default=None, ge=0)
    max_rate: float | None = Field(default=None, ge=0)
    min_rating: float | None = Field(default=None, ge=0, le=5)


class CreateProfessionalRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str = Field(min_length=1)
    trade: str = Field(min_length=1)
    years_experience: int = Field(default=0, ge=0)
    hourly_rate: float = Field(gt=0)
    bio: str | None = None
    experience_summary: str | None = None
    location: str | None = None
    avatar: str | None = None
    availability: str | None = None
    skills: list[str] = Field(default_factory=list)
    trust_badges: list[str] = Field(default_factory=list)
    services_offered: list[ServiceOfferedSchema] = Field(default_factory=list)


class UpdateProfessionalRequest(BaseModel):
    """All fields optional — partial update."""
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str | None = Field(default=None, min_length=1)
    trade: str | None = Field(default=None, min_length=1)
    years_experience: int | None = Field(default=None, ge=0)
    hourly_rate: float | None = Field(default=None, gt=0)
    bio: str | None = None
    experience_summary: str | None = None
    location: str | None = None
    avatar: str | None = None
    availability: str | None = None
    skills: list[str] | None = None
    trust_badges: list[str] | None = None
    services_offered: list[ServiceOfferedSchema] | None = None
