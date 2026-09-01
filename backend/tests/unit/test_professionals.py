"""Tests for modules/professionals — list/search/filter, detail, create, update, delete."""

import pytest

from app.core.errors import ForbiddenError, NotFoundError
from app.modules.professionals import service
from app.modules.professionals.models import Professional, Skill, ProfessionalSkill
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_list_filter_by_trade(db, make_professional):
    """List endpoint applies trade filter correctly."""
    await make_professional(trade="Plumbing")
    await make_professional(trade="Electrical")

    result = await service.list_professionals(db, trade=["Plumbing"])
    assert len(result) == 1
    assert result[0]["trade"] == "Plumbing"


@pytest.mark.asyncio
async def test_list_filter_by_rate(db, make_professional):
    """List endpoint applies rate filter correctly."""
    await make_professional(hourly_rate=30.00)
    await make_professional(hourly_rate=80.00)

    result = await service.list_professionals(db, min_rate=50.0)
    assert len(result) == 1
    assert result[0]["hourlyRate"] == 80.0


@pytest.mark.asyncio
async def test_list_filter_by_rating(db, make_professional):
    """List endpoint applies rating filter correctly."""
    p1 = await make_professional()
    p1.rating_avg = 4.5
    await db.commit()

    p2 = await make_professional()
    p2.rating_avg = 2.0
    await db.commit()

    result = await service.list_professionals(db, min_rating=4.0)
    assert len(result) == 1
    assert result[0]["rating"] == 4.5


@pytest.mark.asyncio
async def test_search_returns_flat_ui_shape(db, make_professional):
    """Search returns the flat UI shape expected by the frontend."""
    pro = await make_professional(title="Master Plumber")

    result = await service.list_professionals(db)
    assert len(result) >= 1
    item = result[0]

    # Must have the flat shape fields
    assert "id" in item
    assert "name" in item
    assert "skills" in item and isinstance(item["skills"], list)
    assert "portfolio" in item and isinstance(item["portfolio"], list)
    assert "trustBadges" in item and isinstance(item["trustBadges"], list)
    assert "servicesOffered" in item and isinstance(item["servicesOffered"], list)


@pytest.mark.asyncio
async def test_update_403_for_non_owner(db, make_user, make_professional):
    """Update raises 403 when the caller doesn't own the professional profile."""
    owner = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=owner)

    other_user = await make_user(role=Role.USER)

    with pytest.raises(ForbiddenError):
        await service.update_professional(db, other_user, pro.id, {"title": "Hacked"})


@pytest.mark.asyncio
async def test_delete_403_for_non_owner(db, make_user, make_professional):
    """Delete raises 403 when the caller doesn't own the professional profile."""
    owner = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=owner)

    other_user = await make_user(role=Role.USER)

    with pytest.raises(ForbiddenError):
        await service.delete_professional(db, other_user, pro.id)


@pytest.mark.asyncio
async def test_detail_raises_not_found(db):
    """Detail raises NotFoundError for an unknown id."""
    with pytest.raises(NotFoundError):
        await service.get_professional_by_id(db, "nonexistent-id")
