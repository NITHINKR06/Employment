"""Tests for modules/disputes — create/list/admin status update."""

import pytest

from app.core.errors import ForbiddenError
from app.modules.disputes import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_create_requires_an_authenticated_user(db, make_user, make_professional, make_booking):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro)

    result = await service.create_dispute(
        db, customer, booking_id=booking.id, subject="Late arrival", description="Pro arrived 2 hours late"
    )

    assert result["status"] == "OPEN"
    assert result["userId"] == customer.id


@pytest.mark.asyncio
async def test_list_mine_only_returns_own_disputes(db, make_user, make_professional, make_booking):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    other_customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro)
    other_booking = await make_booking(user=other_customer, professional=pro)

    await service.create_dispute(db, customer, booking_id=booking.id, subject="A", description="A desc")
    await service.create_dispute(
        db, other_customer, booking_id=other_booking.id, subject="B", description="B desc"
    )

    mine = await service.list_my_disputes(db, customer)
    assert len(mine) == 1
    assert mine[0]["subject"] == "A"


@pytest.mark.asyncio
async def test_non_admin_cannot_change_status(db, make_user, make_professional, make_booking):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro)
    dispute = await service.create_dispute(
        db, customer, booking_id=booking.id, subject="A", description="A desc"
    )

    with pytest.raises(ForbiddenError):
        await service.update_dispute_status(db, customer, dispute["id"], status="RESOLVED")


@pytest.mark.asyncio
async def test_admin_status_update_persists_resolution(db, make_user, make_professional, make_booking):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    admin = await make_user(role=Role.ADMIN)
    booking = await make_booking(user=customer, professional=pro)
    dispute = await service.create_dispute(
        db, customer, booking_id=booking.id, subject="A", description="A desc"
    )

    result = await service.update_dispute_status(
        db, admin, dispute["id"], status="RESOLVED", resolution="Refund issued"
    )

    assert result["status"] == "RESOLVED"
    assert result["resolution"] == "Refund issued"
