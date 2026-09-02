"""Admin request schemas."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ResolveDisputeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    resolution: str = Field(min_length=1, max_length=5000)
