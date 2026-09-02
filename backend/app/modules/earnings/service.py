"""Earnings business logic — read-only aggregation over bookings + payments.

No own table: composes `bookings` (eager-loads `payment`) and `professionals`.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError
from app.modules.bookings import repository as bookings_repository
from app.modules.professionals import repository as professionals_repository
from app.modules.users.models import User

PAID_STATUS = "PAID"
PENDING_STATUSES = {"PENDING"}


async def get_earnings_summary(db: AsyncSession, user: User) -> dict:
    professional = await professionals_repository.find_by_user_id(db, user.id)
    if professional is None:
        raise ForbiddenError("You must have a professional profile to view earnings")

    bookings = await bookings_repository.find_many_by_professional_id(db, professional.id)

    earned = 0.0
    pending = 0.0
    for booking in bookings:
        if booking.payment is None:
            continue
        amount = float(booking.payment.amount)
        if booking.payment.status.value == PAID_STATUS:
            earned += amount
        elif booking.payment.status.value in PENDING_STATUSES:
            pending += amount

    return {
        "earned": round(earned, 2),
        "pending": round(pending, 2),
    }
