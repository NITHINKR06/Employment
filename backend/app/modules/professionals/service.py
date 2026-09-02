"""Professionals service — port of professional.service.js."""

from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError
from app.modules.professionals import repository
from app.modules.professionals.models import Professional
from app.modules.users.models import User


def to_public_shape(professional: Professional) -> dict:
    """Flatten a Professional ORM instance into the shape the frontend expects.

    1:1 port of toPublicShape() from professional.service.js.
    """
    return {
        "id": professional.id,
        "name": professional.user.name,
        "title": professional.title,
        "trade": professional.trade,
        "yearsExperience": professional.years_experience,
        "rating": float(professional.rating_avg),
        "reviewCount": professional.review_count,
        "hourlyRate": float(professional.hourly_rate),
        "avatar": professional.avatar,
        "verified": professional.verified,
        "location": professional.location,
        "latitude": float(professional.latitude) if professional.latitude is not None else None,
        "longitude": float(professional.longitude) if professional.longitude is not None else None,
        "availability": professional.availability,
        "serviceRadiusKm": professional.service_radius_km,
        "skills": [ps.skill.name for ps in professional.skills],
        "bio": professional.bio,
        "experienceSummary": professional.experience_summary,
        "trustBadges": [b.label for b in professional.trust_badges],
        "portfolio": [
            p.url for p in sorted(professional.portfolio_images, key=lambda p: p.position)
        ],
        "servicesOffered": [
            {
                "id": s.id,
                "title": s.title,
                "subtext": s.subtext,
                "price": float(s.price) if s.price is not None else None,
            }
            for s in professional.services
        ],
    }


async def list_professionals(
    db: AsyncSession,
    *,
    trade: list[str] | None = None,
    search: str | None = None,
    min_rate: float | None = None,
    max_rate: float | None = None,
    min_rating: float | None = None,
    min_lat: float | None = None,
    max_lat: float | None = None,
    min_lng: float | None = None,
    max_lng: float | None = None,
    sort: str | None = None,
    near_lat: float | None = None,
    near_lng: float | None = None,
) -> list[dict]:
    professionals = await repository.find_many(
        db,
        trade=trade,
        search=search,
        min_rate=min_rate,
        max_rate=max_rate,
        min_rating=min_rating,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lng=min_lng,
        max_lng=max_lng,
        sort=sort,
        near_lat=near_lat,
        near_lng=near_lng,
    )
    return [to_public_shape(p) for p in professionals]


async def get_professional_by_id(db: AsyncSession, professional_id: str) -> dict:
    professional = await repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    return to_public_shape(professional)


async def get_similar_professionals(db: AsyncSession, professional_id: str, *, limit: int = 6) -> list[dict]:
    professional = await repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    similar = await repository.find_similar(db, professional, limit=limit)
    return [to_public_shape(p) for p in similar]


async def get_my_professional(db: AsyncSession, user: User) -> dict | None:
    professional = await repository.find_by_user_id(db, user.id)
    if professional is None:
        return None
    result = to_public_shape(professional)
    result["email"] = professional.user.email
    return result


async def create_professional(db: AsyncSession, user: User, data: dict) -> dict:
    existing = await repository.find_by_user_id(db, user.id)
    if existing:
        raise ForbiddenError("A professional profile already exists for this account")
    professional = await repository.create(db, user.id, data)
    return to_public_shape(professional)


async def update_professional(db: AsyncSession, user: User, professional_id: str, data: dict) -> dict:
    professional = await repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    if professional.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError()
    updated = await repository.update(db, professional_id, data)
    return to_public_shape(updated)


async def delete_professional(db: AsyncSession, user: User, professional_id: str) -> None:
    professional = await repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    if professional.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError()
    await repository.remove(db, professional_id)
