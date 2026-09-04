"""Time slot persistence operations."""

from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.availability.models import TimeSlot


async def create_many(
    db: AsyncSession, professional_id: str, windows: list[tuple[datetime, datetime]]
) -> list[TimeSlot]:
    """Insert slots, skipping any that already exist for this professional at
    that start time — makes re-running slot generation over an overlapping
    range idempotent instead of duplicating. A uniqueness constraint on
    (professional_id, starts_at) is the actual backstop against a race
    between the read below and the insert; this check just avoids relying on
    that constraint to reject most repeat calls as an error."""
    if not windows:
        return []
    starts_at_values = [starts_at for starts_at, _ in windows]
    existing = await db.execute(
        select(TimeSlot.starts_at).where(
            TimeSlot.professional_id == professional_id,
            TimeSlot.starts_at.in_(starts_at_values),
        )
    )
    already_covered = {row[0] for row in existing}
    slots = [
        TimeSlot(professional_id=professional_id, starts_at=starts_at, ends_at=ends_at)
        for starts_at, ends_at in windows
        if starts_at not in already_covered
    ]
    if not slots:
        return []
    db.add_all(slots)
    await db.commit()
    for slot in slots:
        await db.refresh(slot)
    return slots


async def find_by_id(db: AsyncSession, slot_id: str) -> TimeSlot | None:
    result = await db.execute(select(TimeSlot).where(TimeSlot.id == slot_id))
    return result.scalar_one_or_none()


async def find_by_booking_id(db: AsyncSession, booking_id: str) -> TimeSlot | None:
    result = await db.execute(select(TimeSlot).where(TimeSlot.booking_id == booking_id))
    return result.scalar_one_or_none()


async def find_open_slots(db: AsyncSession, professional_id: str) -> list[TimeSlot]:
    stmt = (
        select(TimeSlot)
        .where(TimeSlot.professional_id == professional_id, TimeSlot.is_booked.is_(False))
        .order_by(TimeSlot.starts_at)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def reserve(db: AsyncSession, slot_id: str, booking_id: str) -> bool:
    """Atomically claim a slot: succeeds only if it was still unbooked.

    A single UPDATE...WHERE statement is the atomic unit here — under
    concurrent callers the database guarantees only one UPDATE matches the
    `is_booked = False` row, so exactly one caller sees rowcount == 1.
    """
    stmt = (
        update(TimeSlot)
        .where(TimeSlot.id == slot_id, TimeSlot.is_booked.is_(False))
        .values(is_booked=True, booking_id=booking_id)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount == 1


async def release(db: AsyncSession, slot_id: str) -> None:
    stmt = update(TimeSlot).where(TimeSlot.id == slot_id).values(is_booked=False, booking_id=None)
    await db.execute(stmt)
    await db.commit()


async def release_by_booking_id(db: AsyncSession, booking_id: str) -> None:
    stmt = (
        update(TimeSlot)
        .where(TimeSlot.booking_id == booking_id)
        .values(is_booked=False, booking_id=None)
    )
    await db.execute(stmt)
    await db.commit()
