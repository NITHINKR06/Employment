"""Reviews Pydantic schemas — port of review.schema.js."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CreateReviewRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    rating: int = Field(ge=1, le=5)
    comment: str | None = None
