"""Tests for modules/verification — submit + admin approve/reject."""

import pytest

from app.core.errors import ForbiddenError
from app.modules.verification import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_submit_requires_caller_to_own_a_professional_profile(db, make_user):
    user_without_profile = await make_user(role=Role.USER)

    with pytest.raises(ForbiddenError):
        await service.submit_verification_request(db, user_without_profile)


@pytest.mark.asyncio
async def test_admin_approve_sets_verified_and_status(db, make_user, make_professional):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user, verified=False)
    admin = await make_user(role=Role.ADMIN)

    request = await service.submit_verification_request(db, pro_user)
    result = await service.approve_request(db, admin, request["id"])

    assert result["status"] == "APPROVED"
    await db.refresh(pro)
    assert pro.verified is True


@pytest.mark.asyncio
async def test_admin_reject_leaves_unverified_and_records_review(db, make_user, make_professional):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user, verified=False)
    admin = await make_user(role=Role.ADMIN)

    request = await service.submit_verification_request(db, pro_user)
    result = await service.reject_request(db, admin, request["id"])

    assert result["status"] == "REJECTED"
    assert result["reviewedBy"] == admin.id
    assert result["reviewedAt"] is not None
    await db.refresh(pro)
    assert pro.verified is False


@pytest.mark.asyncio
async def test_non_admin_cannot_approve_or_reject(db, make_user, make_professional):
    pro_user = await make_user(role=Role.EMPLOYEE)
    await make_professional(user=pro_user, verified=False)
    non_admin = await make_user(role=Role.USER)

    request = await service.submit_verification_request(db, pro_user)

    with pytest.raises(ForbiddenError):
        await service.approve_request(db, non_admin, request["id"])
    with pytest.raises(ForbiddenError):
        await service.reject_request(db, non_admin, request["id"])
