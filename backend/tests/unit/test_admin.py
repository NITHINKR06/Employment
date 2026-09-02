"""Tests for modules/admin — role gating, suspend, analytics, service-layer delegation."""

from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from app.core.errors import ForbiddenError
from app.modules.admin import analytics_service, dispute_service, user_service
from app.modules.payments import repository as payments_repository
from app.modules.users.models import Role


async def _call_list_users(db, user):
    await user_service.list_users(db, user)


async def _call_suspend_user(db, user):
    await user_service.suspend_user(db, user, "some-id")


async def _call_analytics(db, user):
    await analytics_service.get_platform_analytics(db, user)


async def _call_list_disputes(db, user):
    await dispute_service.list_all_disputes(db, user)


ADMIN_OPERATIONS = [
    _call_list_users,
    _call_suspend_user,
    _call_analytics,
    _call_list_disputes,
]


@pytest.mark.asyncio
@pytest.mark.parametrize("operation", ADMIN_OPERATIONS)
async def test_every_admin_route_returns_403_for_non_admin(db, make_user, operation):
    non_admin = await make_user(role=Role.USER)
    with pytest.raises(ForbiddenError):
        await operation(db, non_admin)


@pytest.mark.asyncio
async def test_suspend_sets_user_inactive_and_blocks_subsequent_auth(client, db, make_user):
    admin = await make_user(role=Role.ADMIN)
    target = await make_user(firebase_uid="dev-suspend-target")

    # Suspended user's token still resolves to a User row, but is rejected.
    resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer dev-suspend-target"}
    )
    assert resp.status_code == 200

    result = await user_service.suspend_user(db, admin, target.id)
    assert result["isActive"] is False
    await db.refresh(target)
    assert target.is_active is False

    resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer dev-suspend-target"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_analytics_totals_match_hand_computed_sums(
    db, make_user, make_professional, make_booking
):
    admin = await make_user(role=Role.ADMIN)
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)

    b1 = await make_booking(user=customer, professional=pro)
    await make_booking(user=customer, professional=pro)
    await payments_repository.create_paid(
        db, booking_id=b1.id, amount=Decimal("75.00"), provider="mock-upi", provider_ref="MOCK-1"
    )

    result = await analytics_service.get_platform_analytics(db, admin)

    assert result["totalProfessionals"] == 1
    assert result["totalBookings"] == 2
    assert result["totalRevenue"] == 75.00
    # admin + pro_user + customer
    assert result["totalUsers"] == 3


@pytest.mark.asyncio
async def test_resolve_dispute_delegates_to_disputes_service_not_repository(
    db, make_user, monkeypatch
):
    admin = await make_user(role=Role.ADMIN)
    spy = AsyncMock(return_value={"id": "d1", "status": "RESOLVED"})
    monkeypatch.setattr(dispute_service.disputes_service, "update_dispute_status", spy)

    from app.modules.disputes import repository as disputes_repository

    repo_spy = AsyncMock()
    monkeypatch.setattr(disputes_repository, "update_status", repo_spy)

    await dispute_service.resolve_dispute(db, admin, "d1", resolution="Refunded")

    spy.assert_awaited_once()
    repo_spy.assert_not_awaited()


@pytest.mark.asyncio
async def test_approve_verification_delegates_to_verification_service_not_repository(
    db, make_user, monkeypatch
):
    admin = await make_user(role=Role.ADMIN)
    spy = AsyncMock(return_value={"id": "v1", "status": "APPROVED"})
    monkeypatch.setattr(dispute_service.verification_service, "approve_request", spy)

    from app.modules.verification import repository as verification_repository

    repo_spy = AsyncMock()
    monkeypatch.setattr(verification_repository, "update_status", repo_spy)

    await dispute_service.approve_verification(db, admin, "v1")

    spy.assert_awaited_once()
    repo_spy.assert_not_awaited()
