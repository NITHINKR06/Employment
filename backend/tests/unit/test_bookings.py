"""Tests for modules/bookings — status transitions, ownership, list shapes."""

import pytest

from app.core.errors import ConflictError, ForbiddenError, ValidationError
from app.modules.bookings import repository as bookings_repository
from app.modules.bookings import service
from app.modules.bookings.models import BookingStatus
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_allowed_transitions_succeed(db, make_user, make_professional, make_booking):
    """Every allowed transition succeeds."""
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)

    # PENDING → CONFIRMED
    b1 = await make_booking(user=customer, professional=pro, status=BookingStatus.PENDING)
    result = await service.update_booking_status(db, pro_user, b1.id, "CONFIRMED")
    assert result["status"] == "Confirmed"

    # CONFIRMED → IN_PROGRESS
    result = await service.update_booking_status(db, pro_user, b1.id, "IN_PROGRESS")
    assert result["status"] == "In Progress"

    # IN_PROGRESS → COMPLETED
    result = await service.update_booking_status(db, pro_user, b1.id, "COMPLETED")
    assert result["status"] == "Completed"

    # PENDING → CANCELLED (by customer)
    b2 = await make_booking(user=customer, professional=pro, status=BookingStatus.PENDING)
    result = await service.update_booking_status(db, customer, b2.id, "CANCELLED")
    assert result["status"] == "Cancelled"


@pytest.mark.asyncio
async def test_disallowed_transitions_raise_validation_error(db, make_user, make_professional, make_booking):
    """Every disallowed transition raises a validation error."""
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)

    # COMPLETED → CONFIRMED is not allowed
    b = await make_booking(user=customer, professional=pro, status=BookingStatus.COMPLETED)
    with pytest.raises(ValidationError, match="Cannot move booking"):
        await service.update_booking_status(db, pro_user, b.id, "CONFIRMED")

    # CANCELLED → anything is not allowed
    b2 = await make_booking(user=customer, professional=pro, status=BookingStatus.CANCELLED)
    with pytest.raises(ValidationError, match="Cannot move booking"):
        await service.update_booking_status(db, pro_user, b2.id, "PENDING")


@pytest.mark.asyncio
async def test_non_participant_gets_403(db, make_user, make_professional, make_booking):
    """A user who isn't the booking's customer or professional gets 403."""
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    outsider = await make_user(role=Role.USER)

    b = await make_booking(user=customer, professional=pro)

    with pytest.raises(ForbiddenError):
        await service.update_booking_status(db, outsider, b.id, "CONFIRMED")

    with pytest.raises(ForbiddenError):
        await service.get_booking_by_id(db, outsider, b.id)


@pytest.mark.asyncio
async def test_list_mine_returns_correct_shape(db, make_user, make_professional, make_booking):
    """list_my_bookings returns the counterpart shape for both viewpoints."""
    pro_user = await make_user(role=Role.EMPLOYEE, name="Pro User")
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER, name="Customer")

    await make_booking(user=customer, professional=pro)

    # Customer sees pro's name
    customer_bookings = await service.list_my_bookings(db, customer)
    assert len(customer_bookings) == 1
    assert customer_bookings[0]["name"] == "Pro User"

    # Employee sees customer's name
    employee_bookings = await service.list_my_bookings(db, pro_user)
    assert len(employee_bookings) == 1
    assert employee_bookings[0]["name"] == "Customer"


@pytest.mark.asyncio
async def test_completion_notifies_the_customer_exactly_once(
    db, make_user, make_professional, make_booking, monkeypatch
):
    """Transitioning a booking to COMPLETED triggers exactly one notify_user call."""
    from app.modules.bookings import service as bookings_service

    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro, status=BookingStatus.IN_PROGRESS)

    calls = []

    async def fake_notify_user(db, user_id, *, title, message):
        calls.append((user_id, title, message))

    monkeypatch.setattr(bookings_service.notifications_service, "notify_user", fake_notify_user)

    await service.update_booking_status(db, pro_user, booking.id, "COMPLETED")

    assert len(calls) == 1
    assert calls[0][0] == customer.id


@pytest.mark.asyncio
async def test_create_booking_with_slot_id_reserves_slot_and_sets_scheduled_at(
    db, make_user, make_professional, make_time_slot
):
    """The Booking row must exist before the slot's booking_id FK points at it —
    creating booking then reserving (not the reverse) is what keeps this valid
    against a real foreign-key-enforcing database."""
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    slot = await make_time_slot(professional=pro)

    result = await service.create_booking(
        db, customer, {"professional_id": pro.id, "slot_id": slot.id, "address": "123 Test St"}
    )

    assert result["date"] == slot.starts_at.strftime("%Y-%m-%d")
    await db.refresh(slot)
    assert slot.is_booked is True
    assert slot.booking_id == result["_id"]


@pytest.mark.asyncio
async def test_create_booking_with_already_booked_slot_leaves_no_orphan_booking(
    db, make_user, make_professional, make_time_slot
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    slot = await make_time_slot(professional=pro, is_booked=True, booking_id="other-booking")

    before = await bookings_repository.find_many_by_professional_id(db, pro.id)

    with pytest.raises(ConflictError):
        await service.create_booking(
            db, customer, {"professional_id": pro.id, "slot_id": slot.id, "address": "123 Test St"}
        )

    after = await bookings_repository.find_many_by_professional_id(db, pro.id)
    assert len(after) == len(before)
