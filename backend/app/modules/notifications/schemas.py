"""Notification response schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class NotificationResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel)

    id: str
    title: str
    message: str
    read_at: datetime | None
    created_at: datetime
