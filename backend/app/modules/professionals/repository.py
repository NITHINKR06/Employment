"""Professionals repository — port of professional.repository.js.

The only place that touches Professional/Skill/ProfessionalSkill/TrustBadge/
PortfolioImage/Service tables for this domain.
"""

from sqlalchemy import select, or_, func as sa_func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.modules.bookings.models import Booking
from app.modules.professionals.models import (
    Professional,
    ProfessionalSkill,
    PortfolioImage,
    Service,
    Skill,
    TrustBadge,
)


def _eager_options():
    """Standard eager-load options matching PROFESSIONAL_INCLUDE from JS."""
    return [
        joinedload(Professional.user),
        selectinload(Professional.skills).joinedload(ProfessionalSkill.skill),
        selectinload(Professional.trust_badges),
        selectinload(Professional.portfolio_images),
        selectinload(Professional.services),
    ]


async def find_many(
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
) -> list[Professional]:
    """List/search/filter professionals — port of findMany(), extended with a
    bounding-box location filter and distance/availability/most-booked sorting."""
    stmt = select(Professional).options(*_eager_options())

    if trade:
        stmt = stmt.where(Professional.trade.in_(trade))

    if min_rate is not None:
        stmt = stmt.where(Professional.hourly_rate >= min_rate)
    if max_rate is not None:
        stmt = stmt.where(Professional.hourly_rate <= max_rate)

    if min_rating is not None:
        stmt = stmt.where(Professional.rating_avg >= min_rating)

    if min_lat is not None:
        stmt = stmt.where(Professional.latitude >= min_lat)
    if max_lat is not None:
        stmt = stmt.where(Professional.latitude <= max_lat)
    if min_lng is not None:
        stmt = stmt.where(Professional.longitude >= min_lng)
    if max_lng is not None:
        stmt = stmt.where(Professional.longitude <= max_lng)

    if search:
        pattern = f"%{search}%"
        # Subquery: professional IDs whose skills match the search
        skill_subq = (
            select(ProfessionalSkill.professional_id)
            .join(Skill, ProfessionalSkill.skill_id == Skill.id)
            .where(Skill.name.ilike(pattern))
            .scalar_subquery()
        )
        stmt = stmt.where(
            or_(
                Professional.title.ilike(pattern),
                Professional.trade.ilike(pattern),
                Professional.user.has(
                    # User.name is imported lazily via the relationship
                    sa_func.lower(Professional.user.property.mapper.class_.name).contains(search.lower())
                ),
                Professional.id.in_(skill_subq),
            )
        )

    if sort == "most_booked":
        booking_counts = (
            select(
                Booking.professional_id.label("professional_id"),
                sa_func.count(Booking.id).label("booking_count"),
            )
            .group_by(Booking.professional_id)
            .subquery()
        )
        stmt = stmt.outerjoin(booking_counts, booking_counts.c.professional_id == Professional.id)
        stmt = stmt.order_by(sa_func.coalesce(booking_counts.c.booking_count, 0).desc())
    elif sort == "availability":
        stmt = stmt.order_by(Professional.availability.isnot(None).desc(), Professional.rating_avg.desc())
    else:
        stmt = stmt.order_by(Professional.rating_avg.desc())

    result = await db.execute(stmt)
    professionals = list(result.unique().scalars().all())

    if sort == "distance" and near_lat is not None and near_lng is not None:
        def _distance_key(professional: Professional) -> float:
            if professional.latitude is None or professional.longitude is None:
                return float("inf")
            return (float(professional.latitude) - near_lat) ** 2 + (
                float(professional.longitude) - near_lng
            ) ** 2

        professionals.sort(key=_distance_key)

    return professionals


async def find_similar(
    db: AsyncSession,
    professional: Professional,
    *,
    limit: int = 6,
) -> list[Professional]:
    """Professionals similar to the given one, same-category matches ranked
    ahead of same-trade matches, ahead of everyone else; ties broken by rating."""
    stmt = select(Professional).options(*_eager_options()).where(Professional.id != professional.id)
    result = await db.execute(stmt)
    candidates = list(result.unique().scalars().all())

    def _rank(candidate: Professional) -> tuple[int, float]:
        same_category = (
            professional.category_id is not None and candidate.category_id == professional.category_id
        )
        same_trade = candidate.trade == professional.trade
        tier = 0 if same_category else (1 if same_trade else 2)
        return (tier, -float(candidate.rating_avg))

    candidates.sort(key=_rank)
    return candidates[:limit]


async def find_by_id(db: AsyncSession, professional_id: str) -> Professional | None:
    stmt = (
        select(Professional)
        .options(*_eager_options())
        .where(Professional.id == professional_id)
    )
    result = await db.execute(stmt)
    return result.unique().scalar_one_or_none()


async def find_by_user_id(db: AsyncSession, user_id: str) -> Professional | None:
    stmt = (
        select(Professional)
        .options(*_eager_options())
        .where(Professional.user_id == user_id)
    )
    result = await db.execute(stmt)
    return result.unique().scalar_one_or_none()


async def create(
    db: AsyncSession,
    user_id: str,
    data: dict,
) -> Professional:
    """Create a Professional with nested skills, trust badges, and services.

    Port of professional.repository.js create().
    """
    skills_names: list[str] = data.pop("skills", [])
    trust_badge_labels: list[str] = data.pop("trust_badges", [])
    services_offered: list[dict] = data.pop("services_offered", [])

    professional = Professional(user_id=user_id, **data)
    db.add(professional)
    await db.flush()  # get professional.id

    # Skills: connectOrCreate pattern
    for skill_name in skills_names:
        stmt = select(Skill).where(Skill.name == skill_name)
        result = await db.execute(stmt)
        skill = result.scalar_one_or_none()
        if skill is None:
            skill = Skill(name=skill_name)
            db.add(skill)
            await db.flush()
        ps = ProfessionalSkill(professional_id=professional.id, skill_id=skill.id)
        db.add(ps)

    # Trust badges
    for label in trust_badge_labels:
        db.add(TrustBadge(professional_id=professional.id, label=label))

    # Services
    for svc in services_offered:
        db.add(Service(professional_id=professional.id, **svc))

    await db.commit()
    return await find_by_id(db, professional.id)  # type: ignore[return-value]


async def update(
    db: AsyncSession,
    professional_id: str,
    data: dict,
) -> Professional:
    """Update a Professional with optional relation replacements.

    Port of professional.repository.js update() — delete-all-then-recreate for
    skills/trustBadges/servicesOffered when they're provided.
    """
    skills_names: list[str] | None = data.pop("skills", None)
    trust_badge_labels: list[str] | None = data.pop("trust_badges", None)
    services_offered: list[dict] | None = data.pop("services_offered", None)

    professional = await find_by_id(db, professional_id)
    if professional is None:
        return None  # type: ignore[return-value]

    # Scalar fields
    for key, value in data.items():
        setattr(professional, key, value)

    # Skills: delete all, re-create
    if skills_names is not None:
        for ps in list(professional.skills):
            await db.delete(ps)
        await db.flush()
        for skill_name in skills_names:
            stmt = select(Skill).where(Skill.name == skill_name)
            result = await db.execute(stmt)
            skill = result.scalar_one_or_none()
            if skill is None:
                skill = Skill(name=skill_name)
                db.add(skill)
                await db.flush()
            db.add(ProfessionalSkill(professional_id=professional_id, skill_id=skill.id))

    # Trust badges: delete all, re-create
    if trust_badge_labels is not None:
        for badge in list(professional.trust_badges):
            await db.delete(badge)
        await db.flush()
        for label in trust_badge_labels:
            db.add(TrustBadge(professional_id=professional_id, label=label))

    # Services: delete all, re-create
    if services_offered is not None:
        for svc in list(professional.services):
            await db.delete(svc)
        await db.flush()
        for svc_data in services_offered:
            db.add(Service(professional_id=professional_id, **svc_data))

    await db.commit()
    return await find_by_id(db, professional_id)  # type: ignore[return-value]


async def remove(db: AsyncSession, professional_id: str) -> None:
    professional = await find_by_id(db, professional_id)
    if professional is not None:
        await db.delete(professional)
        await db.commit()


async def update_rating(
    db: AsyncSession,
    professional_id: str,
    rating_avg: float,
    review_count: int,
) -> None:
    """Update cached rating aggregates — called by reviews service."""
    professional = await find_by_id(db, professional_id)
    if professional is not None:
        professional.rating_avg = round(rating_avg, 2)
        professional.review_count = review_count
        await db.commit()
