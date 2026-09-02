"""Tests for modules/users — upsert-on-login logic."""

import pytest

from app.core.errors import NotFoundError
from app.modules.users import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_creates_user_with_default_role(db):
    """Creates a user on first login with correct default role=USER."""
    user = await service.get_or_create_user(
        db, firebase_uid="first-login", email="first@test.com", name="First"
    )
    assert user.role == Role.USER
    assert user.email == "first@test.com"


@pytest.mark.asyncio
async def test_does_not_overwrite_role_on_subsequent_login(db):
    """Does not overwrite role on a subsequent login for an existing user."""
    # Create as USER first
    user = await service.get_or_create_user(
        db, firebase_uid="role-test", email="role@test.com", name="Role Test"
    )
    # Manually promote to ADMIN
    user.role = Role.ADMIN
    await db.commit()

    # Re-login — role should still be ADMIN
    user2 = await service.get_or_create_user(
        db, firebase_uid="role-test", email="role@test.com", name="Role Test"
    )
    assert user2.role == Role.ADMIN
    assert user2.id == user.id


@pytest.mark.asyncio
async def test_get_user_by_id_raises_not_found(db):
    """get_user_by_id raises NotFoundError for an unknown id."""
    with pytest.raises(NotFoundError):
        await service.get_user_by_id(db, "nonexistent-id")
