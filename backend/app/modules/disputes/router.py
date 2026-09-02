"""Disputes router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.disputes import service
from app.modules.disputes.schemas import CreateDisputeRequest, UpdateDisputeStatusRequest
from app.modules.users.models import User

router = APIRouter(prefix="/disputes", tags=["disputes"])


@router.post("", status_code=201)
async def create_dispute(
    body: CreateDisputeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.create_dispute(
        db, user, booking_id=body.booking_id, subject=body.subject, description=body.description
    )
    return {"success": True, "data": {"dispute": data}}


@router.get("")
async def list_my_disputes(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.list_my_disputes(db, user)
    return {"success": True, "data": {"disputes": data}}


@router.get("/{dispute_id}")
async def get_dispute(
    dispute_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.get_dispute_by_id(db, user, dispute_id)
    return {"success": True, "data": {"dispute": data}}


@router.patch("/{dispute_id}")
async def update_dispute_status(
    dispute_id: str,
    body: UpdateDisputeStatusRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin-only status update (delegated from the admin panel)."""
    data = await service.update_dispute_status(
        db, user, dispute_id, status=body.status, resolution=body.resolution
    )
    return {"success": True, "data": {"dispute": data}}
