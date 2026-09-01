"""Payments repository — port of payment.repository.js."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.modules.bookings.models import Booking, BookingStatus
from app.modules.payments.models import Payment, PaymentStatus


async def find_by_booking_id(db: AsyncSession, booking_id: str) -> Payment | None:
    stmt = select(Payment).where(Payment.booking_id == booking_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def find_by_id(db: AsyncSession, payment_id: str) -> Payment | None:
    stmt = (
        select(Payment)
        .options(joinedload(Payment.booking))
        .where(Payment.id == payment_id)
    )
    result = await db.execute(stmt)
    return result.unique().scalar_one_or_none()


async def create_paid(
    db: AsyncSession,
    *,
    booking_id: str,
    amount: float,
    provider: str,
    provider_ref: str,
) -> Payment:
    """Atomic: create PAID payment + auto-confirm PENDING booking.

    Port of payment.repository.js createPaid() $transaction.
    """
    payment = Payment(
        booking_id=booking_id,
        amount=amount,
        status=PaymentStatus.PAID,
        provider=provider,
        provider_ref=provider_ref,
    )
    db.add(payment)

    # Auto-confirm the booking if it's still PENDING
    stmt = select(Booking).where(Booking.id == booking_id)
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    if booking and booking.status == BookingStatus.PENDING:
        booking.status = BookingStatus.CONFIRMED

    await db.commit()
    await db.refresh(payment)
    return payment
