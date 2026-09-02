"""Service-area business logic — a professional's travel radius, and searching within it.

No own table: `service_radius_km` lives on `professionals` (Phase 6 addition).
"""

import math

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.professionals import repository as professionals_repository
from app.modules.professionals.service import to_public_shape
from app.modules.users.models import User

EARTH_RADIUS_KM = 6371.0


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


async def update_service_radius(
    db: AsyncSession, user: User, professional_id: str, *, service_radius_km: int
) -> dict:
    if service_radius_km <= 0:
        raise ValidationError("service_radius_km must be a positive number")

    professional = await professionals_repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    if professional.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError()

    updated = await professionals_repository.update(
        db, professional_id, {"service_radius_km": service_radius_km}
    )
    return to_public_shape(updated)


async def search_within_service_area(db: AsyncSession, *, lat: float, lng: float) -> list[dict]:
    """Professionals whose service_radius_km covers the given point (inclusive boundary)."""
    professionals = await professionals_repository.find_many(db)
    within = [
        p
        for p in professionals
        if p.latitude is not None
        and p.longitude is not None
        and _haversine_km(lat, lng, float(p.latitude), float(p.longitude)) <= p.service_radius_km
    ]
    return [to_public_shape(p) for p in within]
