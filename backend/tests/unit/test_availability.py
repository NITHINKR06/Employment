"""Tests for modules/availability — listing, atomic reservation, release."""

from datetime import date

import pytest

from app.core.errors import ConflictError
from app.modules.availability import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_listing_open_slots_excludes_already_booked(db, make_professional, make_time_slot):
    pro = await make_professional()
    open_slot = await make_time_slot(professional=pro, is_booked=False)
    await make_time_slot(professional=pro, is_booked=True, booking_id="some-booking")

    result = await service.list_open_slots(db, pro.id)

    assert [s["id"] for s in result] == [open_slot.id]


@pytest.mark.asyncio
async def test_reserving_is_atomic_one_wins_one_conflicts(db, make_professional, make_time_slot):
    """Two reservation attempts on the same slot: one wins, one gets a clean conflict."""
    pro = await make_professional()
    slot = await make_time_slot(professional=pro)

    reserved = await service.reserve_slot(db, slot.id, "booking-1")
    assert reserved.is_booked is True
    assert reserved.booking_id == "booking-1"

    with pytest.raises(ConflictError):
        await service.reserve_slot(db, slot.id, "booking-2")


@pytest.mark.asyncio
async def test_releasing_a_slot_makes_it_reservable_again(db, make_professional, make_time_slot):
    pro = await make_professional()
    slot = await make_time_slot(professional=pro)

    await service.reserve_slot(db, slot.id, "booking-1")
    await service.release_slot_for_booking(db, "booking-1")

    open_slots = await service.list_open_slots(db, pro.id)
    assert slot.id in {s["id"] for s in open_slots}

    # And it can be reserved again by someone else.
    reserved_again = await service.reserve_slot(db, slot.id, "booking-2")
    assert reserved_again.booking_id == "booking-2"


@pytest.mark.asyncio
async def test_generating_slots_twice_over_the_same_range_does_not_duplicate(
    db, make_user, make_professional
):
    """Regression test: generate_slots used to insert unconditionally, so
    re-running it over a range you'd already generated silently created
    duplicate slots (one professional accumulated thousands in production)."""
    owner = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=owner)

    first = await service.generate_slots(
        db, owner, pro.id, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1)
    )
    assert len(first) == 8  # 9am-5pm in 60-minute slots

    second = await service.generate_slots(
        db, owner, pro.id, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1)
    )
    assert second == []  # fully covered already — nothing new created

    open_slots = await service.list_open_slots(db, pro.id)
    assert len(open_slots) == 8  # not 16


@pytest.mark.asyncio
async def test_generating_slots_extends_into_a_new_range(db, make_user, make_professional):
    owner = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=owner)

    await service.generate_slots(
        db, owner, pro.id, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1)
    )
    second = await service.generate_slots(
        db, owner, pro.id, start_date=date(2026, 1, 1), end_date=date(2026, 1, 2)
    )

    assert len(second) == 8  # only the new day's slots come back

    open_slots = await service.list_open_slots(db, pro.id)
    assert len(open_slots) == 16  # both days combined
