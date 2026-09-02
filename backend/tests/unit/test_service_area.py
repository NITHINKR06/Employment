"""Tests for modules/service_area — radius update validation, boundary-inclusive search."""

import math

import pytest

from app.core.errors import ValidationError
from app.modules.service_area import service
from app.modules.service_area.service import _haversine_km
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_radius_update_rejects_zero(db, make_user, make_professional):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)

    with pytest.raises(ValidationError):
        await service.update_service_radius(db, pro_user, pro.id, service_radius_km=0)


@pytest.mark.asyncio
async def test_radius_update_rejects_negative(db, make_user, make_professional):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)

    with pytest.raises(ValidationError):
        await service.update_service_radius(db, pro_user, pro.id, service_radius_km=-5)


@pytest.mark.asyncio
async def test_search_includes_professional_exactly_at_the_radius_boundary(
    db, make_user, make_professional
):
    center_lat, center_lng = 12.9716, 77.5946
    target_lat, target_lng = 13.0827, 80.2707  # a real distant point

    # Round up so the integer radius is guaranteed >= the true float distance —
    # this is the "inclusive boundary" case (distance <= radius, at the edge).
    boundary_radius = math.ceil(_haversine_km(center_lat, center_lng, target_lat, target_lng))

    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(
        user=pro_user, latitude=target_lat, longitude=target_lng, service_radius_km=boundary_radius
    )

    result = await service.search_within_service_area(db, lat=center_lat, lng=center_lng)

    assert pro.id in {p["id"] for p in result}


@pytest.mark.asyncio
async def test_search_excludes_professional_just_outside_the_radius(db, make_user, make_professional):
    center_lat, center_lng = 12.9716, 77.5946
    target_lat, target_lng = 13.0827, 80.2707

    # Round down so the integer radius is guaranteed < the true float distance.
    below_radius = max(math.floor(_haversine_km(center_lat, center_lng, target_lat, target_lng)) - 1, 1)

    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(
        user=pro_user,
        latitude=target_lat,
        longitude=target_lng,
        service_radius_km=below_radius,
    )

    result = await service.search_within_service_area(db, lat=center_lat, lng=center_lng)

    assert pro.id not in {p["id"] for p in result}
