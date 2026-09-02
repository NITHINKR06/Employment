"""Favorites router — toggle and list the caller's favorited professionals."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.favorites import service
from app.modules.users.models import User

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("/{professional_id}/toggle")
async def toggle_favorite(
    professional_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Favorite/un-favorite a professional (toggle)."""
    data = await service.toggle_favorite(db, user, professional_id)
    return {"success": True, "data": data}


@router.get("")
async def list_favorites(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List the current user's favorited professionals."""
    data = await service.list_favorites(db, user)
    return {"success": True, "data": {"professionals": data}}
