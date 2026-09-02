"""Tests for modules/earnings — read-only aggregation over bookings + payments."""

from decimal import Decimal

import pytest

from app.core.errors import ForbiddenError
from app.modules.earnings import service
from app.modules.payments import repository as payments_repository
from app.modules.payments.models import Payment, PaymentStatus
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_totals_match_hand_computed_sum(db, make_user, make_professional, make_booking):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)

    b1 = await make_booking(user=customer, professional=pro)
    b2 = await make_booking(user=customer, professional=pro)
    await payments_repository.create_paid(
        db, booking_id=b1.id, amount=Decimal("50.00"), provider="mock-upi", provider_ref="MOCK-1"
    )
    await payments_repository.create_paid(
        db, booking_id=b2.id, amount=Decimal("30.00"), provider="mock-upi", provider_ref="MOCK-2"
    )

    result = await service.get_earnings_summary(db, pro_user)

    assert result["earned"] == 80.00


@pytest.mark.asyncio
async def test_pending_bookings_excluded_from_earned_shown_as_pending(
    db, make_user, make_professional, make_booking
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)

    paid_booking = await make_booking(user=customer, professional=pro)
    pending_booking = await make_booking(user=customer, professional=pro)
    await payments_repository.create_paid(
        db, booking_id=paid_booking.id, amount=Decimal("40.00"), provider="mock-upi", provider_ref="MOCK-1"
    )
    db.add(Payment(booking_id=pending_booking.id, amount=Decimal("20.00"), status=PaymentStatus.PENDING))
    await db.commit()

    result = await service.get_earnings_summary(db, pro_user)

    assert result["earned"] == 40.00
    assert result["pending"] == 20.00


@pytest.mark.asyncio
async def test_professional_only_sees_own_earnings(db, make_user, make_professional, make_booking):
    pro_a_user = await make_user(role=Role.EMPLOYEE)
    pro_a = await make_professional(user=pro_a_user)
    pro_b_user = await make_user(role=Role.EMPLOYEE)
    pro_b = await make_professional(user=pro_b_user)
    customer = await make_user(role=Role.USER)

    booking_a = await make_booking(user=customer, professional=pro_a)
    await payments_repository.create_paid(
        db, booking_id=booking_a.id, amount=Decimal("100.00"), provider="mock-upi", provider_ref="MOCK-1"
    )

    result_a = await service.get_earnings_summary(db, pro_a_user)
    result_b = await service.get_earnings_summary(db, pro_b_user)

    assert result_a["earned"] == 100.00
    assert result_b["earned"] == 0.0


@pytest.mark.asyncio
async def test_raises_forbidden_for_a_user_with_no_professional_profile(db, make_user):
    user = await make_user(role=Role.USER)
    with pytest.raises(ForbiddenError):
        await service.get_earnings_summary(db, user)
