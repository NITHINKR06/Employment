"""RecurringBooking persistence operations."""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.booking_lifecycle.models import RecurringBooking


async def create(db: AsyncSession, data: dict) -> RecurringBooking:
    recurring = RecurringBooking(**data)
    db.add(recurring)
    await db.commit()
    await db.refresh(recurring)
    return recurring


async def find_due(db: AsyncSession, now: datetime) -> list[RecurringBooking]:
    stmt = select(RecurringBooking).where(
        RecurringBooking.active.is_(True), RecurringBooking.next_run_at <= now
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def advance_next_run(db: AsyncSession, recurring: RecurringBooking, next_run_at: datetime) -> None:
    recurring.next_run_at = next_run_at
    await db.commit()
