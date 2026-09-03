"""Professionals router — parse request → call service → return response."""

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user, get_optional_user
from app.modules.professionals import service
from app.modules.professionals.schemas import (
    CreateProfessionalRequest,
    UpdateProfessionalRequest,
)
from app.modules.users.models import User

router = APIRouter(prefix="/professionals", tags=["professionals"])


@router.get("")
async def list_professionals(
    trade: str | None = Query(None),
    search: str | None = Query(None),
    min_rate: float | None = Query(None, alias="minRate", ge=0),
    max_rate: float | None = Query(None, alias="maxRate", ge=0),
    min_rating: float | None = Query(None, alias="minRating", ge=0, le=5),
    min_lat: float | None = Query(None, alias="minLat"),
    max_lat: float | None = Query(None, alias="maxLat"),
    min_lng: float | None = Query(None, alias="minLng"),
    max_lng: float | None = Query(None, alias="maxLng"),
    sort: str | None = Query(None, pattern="^(rating|distance|availability|most_booked)$"),
    near_lat: float | None = Query(None, alias="nearLat"),
    near_lng: float | None = Query(None, alias="nearLng"),
    db: AsyncSession = Depends(get_db),
):
    """List / search / filter professionals (public)."""
    trade_list = [t.strip() for t in trade.split(",") if t.strip()] if trade else None
    data = await service.list_professionals(
        db,
        trade=trade_list,
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
    return {"success": True, "data": {"professionals": data}}


@router.get("/{professional_id}/similar")
async def get_similar_professionals(
    professional_id: str,
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Professionals similar to the given one (public)."""
    data = await service.get_similar_professionals(db, professional_id, limit=limit)
    return {"success": True, "data": {"professionals": data}}


@router.get("/me")
async def get_my_professional(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's own professional profile."""
    data = await service.get_my_professional(db, user)
    return {"success": True, "data": {"professional": data}}


@router.get("/{professional_id}")
async def get_professional(
    professional_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single professional by ID (public)."""
    data = await service.get_professional_by_id(db, professional_id)
    return {"success": True, "data": {"professional": data}}


@router.post("", status_code=201)
async def create_professional(
    body: CreateProfessionalRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a professional profile for the current user."""
    payload = body.model_dump(by_alias=False, exclude_unset=True)
    # Flatten services_offered dicts
    if "services_offered" in payload:
        payload["services_offered"] = [
            s if isinstance(s, dict) else s.model_dump() for s in payload["services_offered"]
        ]
    data = await service.create_professional(db, user, payload)
    return {"success": True, "data": {"professional": data}}


@router.put("/{professional_id}")
async def update_professional(
    professional_id: str,
    body: UpdateProfessionalRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a professional profile (owner or admin)."""
    payload = body.model_dump(by_alias=False, exclude_unset=True)
    if "services_offered" in payload and payload["services_offered"] is not None:
        payload["services_offered"] = [
            s if isinstance(s, dict) else s.model_dump() for s in payload["services_offered"]
        ]
    data = await service.update_professional(db, user, professional_id, payload)
    return {"success": True, "data": {"professional": data}}


@router.delete("/{professional_id}", status_code=204)
async def delete_professional(
    professional_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a professional profile (owner or admin)."""
    await service.delete_professional(db, user, professional_id)
    return Response(status_code=204)
