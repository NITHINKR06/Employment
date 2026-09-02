"""Tests for settings composition and role protection."""

import pytest
from fastapi import HTTPException

from app.modules.settings import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_get_returns_current_user_data(db, make_user):
    user = await make_user(name="Current User", email="current@example.com")
    result = await service.get_settings(db, user)

    assert result["name"] == "Current User"
    assert result["email"] == "current@example.com"
    assert result["role"] == "USER"


@pytest.mark.asyncio
async def test_patch_persists_for_subsequent_get(db, make_user):
    user = await make_user(name="Before")
    await service.update_settings(db, user, {"name": "After", "phone": "+91 99999"})

    result = await service.get_settings(db, user)
    assert result["name"] == "After"
    assert result["phone"] == "+91 99999"


@pytest.mark.asyncio
async def test_employee_only_fields_rejected_for_user(db, make_user):
    user = await make_user(role=Role.USER)
    with pytest.raises(HTTPException) as exc:
        await service.update_settings(db, user, {"title": "Electrician"})
    assert exc.value.status_code == 422
