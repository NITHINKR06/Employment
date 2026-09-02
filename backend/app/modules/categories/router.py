"""Public categories endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.modules.categories import service

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all categories with their professional counts (public)."""
    data = await service.list_categories_with_counts(db)
    return {"success": True, "data": {"categories": data}}
