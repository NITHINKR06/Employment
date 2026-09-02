"""Disputes persistence operations."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.modules.disputes.models import Dispute, DisputeStatus


def _eager_options():
    return [joinedload(Dispute.user), joinedload(Dispute.booking)]


async def create(db: AsyncSession, *, user_id: str, booking_id: str, subject: str, description: str) -> Dispute:
    dispute = Dispute(user_id=user_id, booking_id=booking_id, subject=subject, description=description)
    db.add(dispute)
    await db.commit()
    await db.refresh(dispute)
    return dispute


async def find_by_id(db: AsyncSession, dispute_id: str) -> Dispute | None:
    stmt = select(Dispute).options(*_eager_options()).where(Dispute.id == dispute_id)
    result = await db.execute(stmt)
    return result.unique().scalar_one_or_none()


async def find_many_by_user_id(db: AsyncSession, user_id: str) -> list[Dispute]:
    stmt = (
        select(Dispute)
        .options(*_eager_options())
        .where(Dispute.user_id == user_id)
        .order_by(Dispute.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.unique().scalars().all())


async def find_all(db: AsyncSession) -> list[Dispute]:
    stmt = select(Dispute).options(*_eager_options()).order_by(Dispute.created_at.desc())
    result = await db.execute(stmt)
    return list(result.unique().scalars().all())


async def update_status(
    db: AsyncSession, dispute: Dispute, status: DisputeStatus, *, resolution: str | None, resolved_by: str
) -> Dispute:
    dispute.status = status
    dispute.resolution = resolution
    dispute.resolved_by = resolved_by
    dispute.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(dispute)
    return dispute
