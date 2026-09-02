"""Favorites business logic."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.modules.favorites import repository
from app.modules.professionals import repository as professionals_repository
from app.modules.professionals.service import to_public_shape
from app.modules.users.models import User


async def toggle_favorite(db: AsyncSession, user: User, professional_id: str) -> dict:
    """Toggle a professional in/out of the caller's favorites. Idempotent per call."""
    professional = await professionals_repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")

    existing = await repository.find(db, user.id, professional_id)
    if existing is not None:
        await repository.delete(db, existing)
        return {"favorited": False}

    await repository.create(db, user.id, professional_id)
    return {"favorited": True}


async def list_favorites(db: AsyncSession, user: User) -> list[dict]:
    favorites = await repository.find_many_for_user(db, user.id)
    return [to_public_shape(favorite.professional) for favorite in favorites]
