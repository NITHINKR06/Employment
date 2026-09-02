"""Push subscription persistence operations."""

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.push.models import PushSubscription


async def find_by_user_and_endpoint(
    db: AsyncSession, user_id: str, endpoint: str
) -> PushSubscription | None:
    stmt = select(PushSubscription).where(
        PushSubscription.user_id == user_id, PushSubscription.endpoint == endpoint
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create(db: AsyncSession, *, user_id: str, endpoint: str, p256dh: str, auth: str) -> PushSubscription:
    subscription = PushSubscription(user_id=user_id, endpoint=endpoint, p256dh=p256dh, auth=auth)
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    return subscription


async def find_many_for_user(db: AsyncSession, user_id: str) -> list[PushSubscription]:
    stmt = select(PushSubscription).where(PushSubscription.user_id == user_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def delete_by_user_and_endpoint(db: AsyncSession, user_id: str, endpoint: str) -> None:
    stmt = delete(PushSubscription).where(
        PushSubscription.user_id == user_id, PushSubscription.endpoint == endpoint
    )
    await db.execute(stmt)
    await db.commit()


async def delete_by_id(db: AsyncSession, subscription_id: str) -> None:
    stmt = delete(PushSubscription).where(PushSubscription.id == subscription_id)
    await db.execute(stmt)
    await db.commit()
