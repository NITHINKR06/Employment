"""Bookings repository — port of booking.repository.js."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.modules.bookings.models import Booking, BookingStatus
from app.modules.professionals.models import Professional


def _eager_options():
    """Match BOOKING_INCLUDE from JS."""
    return [
        joinedload(Booking.user),
        joinedload(Booking.professional).joinedload(Professional.user),
        joinedload(Booking.service),
        joinedload(Booking.payment),
        joinedload(Booking.review),
    ]


async def create(db: AsyncSession, data: dict) -> Booking:
    booking = Booking(**data)
    db.add(booking)
    await db.commit()
    return await find_by_id(db, booking.id)  # type: ignore[return-value]


async def find_by_id(db: AsyncSession, booking_id: str) -> Booking | None:
    stmt = select(Booking).options(*_eager_options()).where(Booking.id == booking_id)
    result = await db.execute(stmt)
    return result.unique().scalar_one_or_none()


async def find_many_by_user_id(db: AsyncSession, user_id: str) -> list[Booking]:
    stmt = (
        select(Booking)
        .options(*_eager_options())
        .where(Booking.user_id == user_id)
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.unique().scalars().all())


async def find_many_by_professional_id(db: AsyncSession, professional_id: str) -> list[Booking]:
    stmt = (
        select(Booking)
        .options(*_eager_options())
        .where(Booking.professional_id == professional_id)
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.unique().scalars().all())


async def remove(db: AsyncSession, booking_id: str) -> None:
    booking = await find_by_id(db, booking_id)
    if booking is not None:
        await db.delete(booking)
        await db.commit()


async def update_status(db: AsyncSession, booking_id: str, status: BookingStatus) -> Booking:
    booking = await find_by_id(db, booking_id)
    if booking is not None:
        booking.status = status
        await db.commit()
        await db.refresh(booking)
        # Re-fetch with eager loads
        return await find_by_id(db, booking_id)  # type: ignore[return-value]
    return None  # type: ignore[return-value]
