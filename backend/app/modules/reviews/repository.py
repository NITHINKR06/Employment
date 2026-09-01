"""Reviews repository — port of review.repository.js."""

from sqlalchemy import select, func as sa_func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.modules.bookings.models import Booking
from app.modules.reviews.models import Review


async def find_by_booking_id(db: AsyncSession, booking_id: str) -> Review | None:
    stmt = select(Review).where(Review.booking_id == booking_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create(db: AsyncSession, *, booking_id: str, rating: int, comment: str | None) -> Review:
    review = Review(booking_id=booking_id, rating=rating, comment=comment)
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


async def find_many_by_professional_id(db: AsyncSession, professional_id: str) -> list[Review]:
    stmt = (
        select(Review)
        .join(Booking, Review.booking_id == Booking.id)
        .options(
            joinedload(Review.booking).joinedload(Booking.user),
        )
        .where(Booking.professional_id == professional_id)
        .order_by(Review.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.unique().scalars().all())


async def aggregate_for_professional(db: AsyncSession, professional_id: str) -> dict:
    """Return {avg: float, count: int} for a professional's reviews."""
    stmt = (
        select(
            sa_func.coalesce(sa_func.avg(Review.rating), 0).label("avg"),
            sa_func.count(Review.rating).label("count"),
        )
        .join(Booking, Review.booking_id == Booking.id)
        .where(Booking.professional_id == professional_id)
    )
    result = await db.execute(stmt)
    row = result.one()
    return {"avg": float(row.avg), "count": int(row.count)}
