"""Earnings business logic — read-only aggregation over bookings + payments.

No own table: composes `bookings` (eager-loads `payment`) and `professionals`.

Amounts are summed as `Decimal` throughout and only converted to `float` at
the very end, right before JSON serialization — summing as `float` (the
previous approach) accumulates binary floating-point rounding error across
many transactions, which matters for money.
"""

from collections import defaultdict
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError
from app.modules.bookings import repository as bookings_repository
from app.modules.bookings.models import BookingStatus
from app.modules.professionals import repository as professionals_repository
from app.modules.users.models import User

PAID_STATUS = "PAID"
PENDING_STATUSES = {"PENDING"}
REFUNDED_STATUS = "REFUNDED"

CENTS = Decimal("0.01")


def _money(value: Decimal) -> float:
    return float(value.quantize(CENTS, rounding=ROUND_HALF_UP))


async def get_earnings_summary(db: AsyncSession, user: User) -> dict:
    professional = await professionals_repository.find_by_user_id(db, user.id)
    if professional is None:
        raise ForbiddenError("You must have a professional profile to view earnings")

    bookings = await bookings_repository.find_many_by_professional_id(db, professional.id)

    earned = Decimal("0")
    pending = Decimal("0")
    refunded = Decimal("0")
    paid_count = 0
    cancelled_count = 0
    monthly: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {"earned": Decimal("0"), "refunded": Decimal("0")}
    )

    for booking in bookings:
        if booking.status == BookingStatus.CANCELLED:
            cancelled_count += 1

        payment = booking.payment
        if payment is None:
            continue

        amount = payment.amount
        month_key = booking.created_at.strftime("%Y-%m")

        if payment.status.value == PAID_STATUS:
            earned += amount
            paid_count += 1
            monthly[month_key]["earned"] += amount
        elif payment.status.value in PENDING_STATUSES:
            pending += amount
        elif payment.status.value == REFUNDED_STATUS:
            refunded += amount
            monthly[month_key]["refunded"] += amount

    average_per_booking = earned / paid_count if paid_count else Decimal("0")

    monthly_series = [
        {
            "month": month,
            "earned": _money(values["earned"]),
            "refunded": _money(values["refunded"]),
        }
        for month, values in sorted(monthly.items())
    ]

    return {
        "earned": _money(earned),
        "pending": _money(pending),
        "refunded": _money(refunded),
        "averagePerBooking": _money(average_per_booking),
        "paidCount": paid_count,
        "cancelledCount": cancelled_count,
        "monthly": monthly_series,
    }
