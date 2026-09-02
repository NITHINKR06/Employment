"""Service-area router."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.service_area import service
from app.modules.service_area.schemas import UpdateServiceRadiusRequest
from app.modules.users.models import User

router = APIRouter(prefix="/service-area", tags=["service-area"])


@router.patch("/professionals/{professional_id}")
async def update_service_radius(
    professional_id: str,
    body: UpdateServiceRadiusRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.update_service_radius(
        db, user, professional_id, service_radius_km=body.service_radius_km
    )
    return {"success": True, "data": {"professional": data}}


@router.get("/search")
async def search_within_service_area(
    lat: float = Query(...),
    lng: float = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Professionals whose service radius covers the given point (public)."""
    data = await service.search_within_service_area(db, lat=lat, lng=lng)
    return {"success": True, "data": {"professionals": data}}
