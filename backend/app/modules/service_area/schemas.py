"""Service-area request schemas."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class UpdateServiceRadiusRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    service_radius_km: int = Field(gt=0, le=500)
