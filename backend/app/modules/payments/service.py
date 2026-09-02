"""Payments service — port of payment.service.js (mock provider only)."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.bookings import repository as booking_repo
from app.modules.payments import repository
from app.modules.payments.models import Payment, PaymentStatus
from app.modules.users.models import User


def _to_public_shape(payment: Payment) -> dict:
    return {
        "id": payment.id,
        "bookingId": payment.booking_id,
        "amount": float(payment.amount),
        "status": payment.status.value,
        "provider": payment.provider,
        "providerRef": payment.provider_ref,
        "createdAt": payment.created_at.isoformat() if payment.created_at else None,
    }


async def pay_for_booking(
    db: AsyncSession,
    user: User,
    *,
    booking_id: str,
    amount: float,
    method: str | None = None,
) -> dict:
    """Mock payment — marks PAID immediately.

    Port of payment.service.js payForBooking().
    """
    booking = await booking_repo.find_by_id(db, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.user_id != user.id:
        raise ForbiddenError("This booking does not belong to you")

    existing = await repository.find_by_booking_id(db, booking_id)
    if existing:
        raise ValidationError("This booking has already been paid for")

    payment = await repository.create_paid(
        db,
        booking_id=booking_id,
        amount=amount,
        provider=f"mock-{method or 'upi'}",
        provider_ref=f"MOCK-{uuid.uuid4()}",
    )
    return _to_public_shape(payment)


async def refund_payment(db: AsyncSession, payment_id: str) -> dict:
    """Mock refund — marks a PAID payment REFUNDED. Never calls a real gateway."""
    payment = await repository.find_by_id(db, payment_id)
    if payment is None:
        raise NotFoundError("Payment not found")
    if payment.status != PaymentStatus.PAID:
        raise ValidationError("Only a paid payment can be refunded")
    payment.status = PaymentStatus.REFUNDED
    await db.commit()
    await db.refresh(payment)
    return _to_public_shape(payment)


async def get_payment_by_id(db: AsyncSession, user: User, payment_id: str) -> dict:
    payment = await repository.find_by_id(db, payment_id)
    if payment is None:
        raise NotFoundError("Payment not found")
    if payment.booking.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError()
    return _to_public_shape(payment)
