"""Notification business logic."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.modules.notifications import repository
from app.modules.notifications.models import Notification
from app.modules.users.models import User


def _to_shape(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "readAt": notification.read_at.isoformat() if notification.read_at else None,
        "createdAt": notification.created_at.isoformat() if notification.created_at else None,
    }


async def notify_user(db: AsyncSession, user_id: str, *, title: str, message: str) -> dict:
    return _to_shape(await repository.create(db, user_id=user_id, title=title, message=message))


async def list_notifications(db: AsyncSession, user: User) -> list[dict]:
    return [_to_shape(item) for item in await repository.find_many_for_user(db, user.id)]


async def mark_notification_read(db: AsyncSession, user: User, notification_id: str) -> dict:
    notification = await repository.find_by_id_for_user(db, notification_id, user.id)
    if notification is None:
        raise NotFoundError("Notification not found")
    return _to_shape(await repository.mark_read(db, notification))


async def clear_notifications(db: AsyncSession, user: User) -> None:
    await repository.clear_for_user(db, user.id)
