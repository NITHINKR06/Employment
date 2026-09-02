"""Tests for modules/payments — mock provider, duplicate rejection, ownership."""

import pytest

from app.core.errors import ForbiddenError, ValidationError
from app.modules.bookings.models import BookingStatus
from app.modules.payments import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_paying_pending_booking_marks_confirmed(db, make_user, make_professional, make_booking):
    """Paying a PENDING booking marks it CONFIRMED in the same transaction."""
    customer = await make_user(role=Role.USER)
    pro = await make_professional()
    booking = await make_booking(user=customer, professional=pro, status=BookingStatus.PENDING)

    result = await service.pay_for_booking(
        db, customer, booking_id=booking.id, amount=100.0, method="upi"
    )
    assert result["status"] == "PAID"
    assert result["provider"].startswith("mock-")

    # Verify booking was auto-confirmed
    from app.modules.bookings import repository as booking_repo
    updated_booking = await booking_repo.find_by_id(db, booking.id)
    assert updated_booking.status == BookingStatus.CONFIRMED


@pytest.mark.asyncio
async def test_second_payment_rejected(db, make_user, make_professional, make_booking):
    """A second payment attempt on an already-paid booking is rejected."""
    customer = await make_user(role=Role.USER)
    pro = await make_professional()
    booking = await make_booking(user=customer, professional=pro)

    await service.pay_for_booking(db, customer, booking_id=booking.id, amount=100.0)

    with pytest.raises(ValidationError, match="already been paid"):
        await service.pay_for_booking(db, customer, booking_id=booking.id, amount=100.0)


@pytest.mark.asyncio
async def test_non_owner_cannot_pay(db, make_user, make_professional, make_booking):
    """A user who doesn't own the booking cannot pay."""
    customer = await make_user(role=Role.USER)
    other = await make_user(role=Role.USER)
    pro = await make_professional()
    booking = await make_booking(user=customer, professional=pro)

    with pytest.raises(ForbiddenError):
        await service.pay_for_booking(db, other, booking_id=booking.id, amount=100.0)
