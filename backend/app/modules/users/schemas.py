"""Users Pydantic schemas — request/response models."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class UserResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    firebase_uid: str
    email: str
    name: str
    phone: str | None = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
