"""Tests for modules/availability — listing, atomic reservation, release."""

import pytest

from app.core.errors import ConflictError
from app.modules.availability import service


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
