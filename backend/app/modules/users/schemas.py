"""Users Pydantic schemas — request/response models."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CreateSessionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    # Only meaningful the first time this account is ever seen — see
    # users.service.get_or_create_user. Never lets an existing user change role.
    role: str | None = Field(default=None, pattern=r"^(USER|EMPLOYEE)$")


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
