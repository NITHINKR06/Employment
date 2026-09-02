"""Portfolio request schemas."""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class AddPortfolioImageRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    url: str = Field(min_length=1)


class ReorderPortfolioRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    ordered_ids: list[str] = Field(min_length=1)
