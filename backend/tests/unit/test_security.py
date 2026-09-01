"""Tests for core/security.py — Firebase token verification + auth dependencies."""

import pytest
from unittest.mock import MagicMock, patch

from app.modules.users.models import Role, User
from tests.conftest import auth_headers


@pytest.mark.asyncio
async def test_get_current_user_401_on_missing_token(client):
    """get_current_user raises 401 when no Authorization header is sent."""
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_current_user_401_on_invalid_token(client):
    """get_current_user raises 401 when the token verification fails."""
    with patch("app.core.security._get_firebase_app", return_value=MagicMock()):
        with patch(
            "app.core.security.firebase_auth.verify_id_token",
            side_effect=Exception("bad token"),
        ):
            resp = await client.get(
                "/api/v1/auth/me",
                headers={"Authorization": "Bearer bad-token"},
            )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_upserts_new_user(client, db):
    """get_current_user creates a new User row on the first verified token."""
    decoded = {"uid": "new-uid-123", "email": "new@test.com", "name": "New User"}
    with patch("app.core.security._get_firebase_app", return_value=MagicMock()):
        with patch("app.core.security.firebase_auth.verify_id_token", return_value=decoded):
            resp = await client.get(
                "/api/v1/auth/me",
                headers={"Authorization": "Bearer valid-token"},
            )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["user"]["email"] == "new@test.com"
    assert body["data"]["user"]["role"] == "USER"  # default role


@pytest.mark.asyncio
async def test_get_current_user_returns_existing_user(client, db, make_user):
    """get_current_user returns the existing User on repeat calls (no duplicate)."""
    user = await make_user(firebase_uid="repeat-uid", email="repeat@test.com")
    decoded = {"uid": "repeat-uid", "email": "repeat@test.com", "name": user.name}
    with patch("app.core.security._get_firebase_app", return_value=MagicMock()):
        with patch("app.core.security.firebase_auth.verify_id_token", return_value=decoded):
            resp = await client.get(
                "/api/v1/auth/me",
                headers={"Authorization": "Bearer valid-token"},
            )
    assert resp.status_code == 200
    assert resp.json()["data"]["user"]["id"] == user.id  # same user, not a new one


@pytest.mark.asyncio
async def test_require_role_admin_403_for_non_admin(client, db, make_user):
    """require_role('ADMIN') raises 403 for a USER-role caller.

    We test this indirectly — admin routes don't exist in Phase 0 yet,
    so we test the dependency directly.
    """
    from app.core.security import require_role
    from app.core.errors import ForbiddenError

    user = await make_user(role=Role.USER)

    dep = require_role("ADMIN")
    with pytest.raises(ForbiddenError):
        await dep(user=user)


@pytest.mark.asyncio
async def test_require_role_admin_passes_for_admin(client, db, make_user):
    """require_role('ADMIN') passes for an ADMIN-role caller."""
    from app.core.security import require_role

    user = await make_user(role=Role.ADMIN)

    dep = require_role("ADMIN")
    result = await dep(user=user)
    assert result.id == user.id
