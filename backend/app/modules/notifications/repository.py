"""Notification persistence operations."""

from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notification


async def create(db: AsyncSession, *, user_id: str, title: str, message: str) -> Notification:
    notification = Notification(user_id=user_id, title=title, message=message)
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def find_many_for_user(db: AsyncSession, user_id: str) -> list[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
    )
    return list(result.scalars().all())


async def find_by_id_for_user(db: AsyncSession, notification_id: str, user_id: str) -> Notification | None:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id, Notification.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


async def mark_read(db: AsyncSession, notification: Notification) -> Notification:
    if notification.read_at is None:
        notification.read_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(notification)
    return notification


async def clear_for_user(db: AsyncSession, user_id: str) -> None:
    await db.execute(delete(Notification).where(Notification.user_id == user_id))
    await db.commit()
