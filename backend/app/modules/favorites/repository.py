"""Favorites persistence operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.modules.favorites.models import Favorite
from app.modules.professionals.models import Professional, ProfessionalSkill


def _professional_eager_options():
    return [
        selectinload(Favorite.professional).joinedload(Professional.user),
        selectinload(Favorite.professional)
        .selectinload(Professional.skills)
        .joinedload(ProfessionalSkill.skill),
        selectinload(Favorite.professional).selectinload(Professional.trust_badges),
        selectinload(Favorite.professional).selectinload(Professional.portfolio_images),
        selectinload(Favorite.professional).selectinload(Professional.services),
    ]


async def find(db: AsyncSession, user_id: str, professional_id: str) -> Favorite | None:
    stmt = select(Favorite).where(
        Favorite.user_id == user_id, Favorite.professional_id == professional_id
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create(db: AsyncSession, user_id: str, professional_id: str) -> Favorite:
    favorite = Favorite(user_id=user_id, professional_id=professional_id)
    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)
    return favorite


async def delete(db: AsyncSession, favorite: Favorite) -> None:
    await db.delete(favorite)
    await db.commit()


async def find_many_for_user(db: AsyncSession, user_id: str) -> list[Favorite]:
    stmt = (
        select(Favorite)
        .options(*_professional_eager_options())
        .where(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.unique().scalars().all())
