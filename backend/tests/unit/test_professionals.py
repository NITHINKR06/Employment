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
async def test_update_persists_latitude_and_longitude(db, make_user, make_professional):
    """Updating a professional's location can also set its geocoded coordinates."""
    owner = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=owner)

    result = await service.update_professional(
        db, owner, pro.id, {"location": "Nitte, Karnataka", "latitude": 13.1723, "longitude": 74.9298}
    )

    assert result["latitude"] == 13.1723
    assert result["longitude"] == 74.9298


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


@pytest.mark.asyncio
async def test_similar_excludes_the_professional_itself(db, make_professional):
    pro = await make_professional(trade="Plumbing")
    await make_professional(trade="Plumbing")

    result = await service.get_similar_professionals(db, pro.id)

    assert pro.id not in {p["id"] for p in result}


@pytest.mark.asyncio
async def test_similar_prioritizes_same_category_over_others(db, make_professional):
    pro = await make_professional(trade="Plumbing", category_id="cat-1")
    same_category = await make_professional(trade="Electrical", category_id="cat-1")
    same_trade_only = await make_professional(trade="Plumbing", category_id="cat-2")
    unrelated = await make_professional(trade="Landscaping", category_id="cat-3")

    result = await service.get_similar_professionals(db, pro.id)
    ids_in_order = [p["id"] for p in result]

    assert ids_in_order.index(same_category.id) < ids_in_order.index(same_trade_only.id)
    assert ids_in_order.index(same_trade_only.id) < ids_in_order.index(unrelated.id)


@pytest.mark.asyncio
async def test_similar_raises_not_found_for_unknown_id(db):
    with pytest.raises(NotFoundError):
        await service.get_similar_professionals(db, "nonexistent-id")


@pytest.mark.asyncio
async def test_sort_by_availability_orders_available_first(db, make_professional):
    unavailable = await make_professional(availability=None)
    available = await make_professional(availability="Weekdays")

    result = await service.list_professionals(db, sort="availability")

    assert [p["id"] for p in result][0] == available.id
    assert available.id in {p["id"] for p in result}
    assert unavailable.id in {p["id"] for p in result}


@pytest.mark.asyncio
async def test_sort_by_most_booked_orders_by_booking_count(db, make_professional, make_booking, make_user):
    quiet = await make_professional()
    busy = await make_professional()
    customer = await make_user()
    await make_booking(user=customer, professional=busy)
    await make_booking(user=customer, professional=busy)
    await make_booking(user=customer, professional=quiet)

    result = await service.list_professionals(db, sort="most_booked")
    ids_in_order = [p["id"] for p in result]

    assert ids_in_order.index(busy.id) < ids_in_order.index(quiet.id)


@pytest.mark.asyncio
async def test_sort_by_distance_orders_nearest_first(db, make_professional):
    far = await make_professional(latitude=51.5, longitude=-0.1)
    near = await make_professional(latitude=40.71, longitude=-74.01)

    result = await service.list_professionals(db, sort="distance", near_lat=40.70, near_lng=-74.00)
    ids_in_order = [p["id"] for p in result]

    assert ids_in_order.index(near.id) < ids_in_order.index(far.id)
