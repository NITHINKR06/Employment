"""Tests for modules/booking_lifecycle — reschedule, recurring bookings, cancellation policy."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from app.core.errors import ConflictError, ValidationError
from app.modules.booking_lifecycle import service
from app.modules.bookings.models import BookingStatus
from app.modules.payments import repository as payments_repository
from app.modules.payments.models import PaymentStatus
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_reschedule_to_already_booked_slot_is_rejected(
    db, make_user, make_professional, make_booking, make_time_slot
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro)

    taken_slot = await make_time_slot(professional=pro, is_booked=True, booking_id="other-booking")

    with pytest.raises(ConflictError):
        await service.reschedule_booking(db, customer, booking.id, taken_slot.id)


@pytest.mark.asyncio
async def test_reschedule_to_open_slot_releases_old_and_reserves_new(
    db, make_user, make_professional, make_booking, make_time_slot
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro)

    old_slot = await make_time_slot(professional=pro, is_booked=True, booking_id=booking.id)
    new_slot = await make_time_slot(
        professional=pro, starts_at=datetime(2026, 2, 1, 10, 0), is_booked=False
    )

    result = await service.reschedule_booking(db, customer, booking.id, new_slot.id)

    await db.refresh(old_slot)
    await db.refresh(new_slot)
    assert old_slot.is_booked is False
    assert new_slot.is_booked is True
    assert new_slot.booking_id == booking.id
    assert result["date"] == "2026-02-01"


@pytest.mark.asyncio
async def test_recurring_booking_creates_one_per_due_cycle(db, make_user, make_professional):
    customer = await make_user()
    pro = await make_professional()

    now = datetime(2026, 1, 15, tzinfo=timezone.utc)
    due = await service.create_recurring_booking(
        db,
        customer,
        professional_id=pro.id,
        service_id=None,
        address="123 Test St",
        notes=None,
        frequency="WEEKLY",
        starts_at=now - timedelta(days=1),
    )
    not_due = await service.create_recurring_booking(
        db,
        customer,
        professional_id=pro.id,
        service_id=None,
        address="123 Test St",
        notes=None,
        frequency="WEEKLY",
        starts_at=now + timedelta(days=7),
    )

    created = await service.run_due_recurring_bookings(db, now=now)

    assert len(created) == 1


@pytest.mark.asyncio
async def test_cancellation_inside_cutoff_is_rejected(db, make_user, make_professional, make_booking):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(
        user=customer,
        professional=pro,
        scheduled_at=datetime.now(timezone.utc) + timedelta(hours=2),
    )

    with pytest.raises(ValidationError):
        await service.cancel_booking_with_policy(db, customer, booking.id)


@pytest.mark.asyncio
async def test_cancellation_outside_cutoff_is_allowed_with_full_refund(
    db, make_user, make_professional, make_booking
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(
        user=customer,
        professional=pro,
        scheduled_at=datetime.now(timezone.utc) + timedelta(days=3),
    )
    payment = await payments_repository.create_paid(
        db, booking_id=booking.id, amount=Decimal("50.00"), provider="mock-upi", provider_ref="MOCK-1"
    )

    result = await service.cancel_booking_with_policy(db, customer, booking.id)

    assert result["status"] == "Cancelled"
    await db.refresh(payment)
    assert payment.status == PaymentStatus.REFUNDED


@pytest.mark.asyncio
async def test_refund_only_calls_the_mock_payments_service(
    db, make_user, make_professional, make_booking, monkeypatch
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(
        user=customer,
        professional=pro,
        scheduled_at=datetime.now(timezone.utc) + timedelta(days=3),
    )
    await payments_repository.create_paid(
        db, booking_id=booking.id, amount=Decimal("50.00"), provider="mock-upi", provider_ref="MOCK-1"
    )

    fake_refund = AsyncMock(return_value={"status": "REFUNDED"})
    monkeypatch.setattr(service.payments_service, "refund_payment", fake_refund)

    await service.cancel_booking_with_policy(db, customer, booking.id)

    fake_refund.assert_awaited_once()
