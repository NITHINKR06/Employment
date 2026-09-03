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


@pytest.mark.asyncio
async def test_first_login_applies_a_chosen_self_serve_role(db):
    """A signup flow can choose EMPLOYEE at first login (e.g. 'I offer a service')."""
    user = await service.get_or_create_user(
        db, firebase_uid="new-pro", email="pro@test.com", name="New Pro", role="EMPLOYEE"
    )
    assert user.role == Role.EMPLOYEE


@pytest.mark.asyncio
async def test_role_param_never_changes_an_existing_users_role(db):
    """The role hint only ever applies to a brand-new account — never a returning one."""
    user = await service.get_or_create_user(
        db, firebase_uid="existing-user", email="existing@test.com", name="Existing", role="USER"
    )
    assert user.role == Role.USER

    # A later "login" that happens to pass role=EMPLOYEE must not promote them.
    user2 = await service.get_or_create_user(
        db, firebase_uid="existing-user", email="existing@test.com", name="Existing", role="EMPLOYEE"
    )
    assert user2.role == Role.USER
    assert user2.id == user.id


@pytest.mark.asyncio
async def test_role_param_cannot_be_used_to_self_serve_admin(db):
    """ADMIN is never settable through the self-serve signup path."""
    user = await service.get_or_create_user(
        db, firebase_uid="sneaky", email="sneaky@test.com", name="Sneaky", role="ADMIN"
    )
    assert user.role == Role.USER
