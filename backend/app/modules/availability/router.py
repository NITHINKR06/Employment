"""Availability router — generate and list a professional's time slots."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.availability import service
from app.modules.availability.schemas import GenerateSlotsRequest
from app.modules.users.models import User

router = APIRouter(prefix="/availability", tags=["availability"])


@router.post("/{professional_id}/generate", status_code=201)
async def generate_slots(
    professional_id: str,
    body: GenerateSlotsRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate open time slots for a professional (owner or admin)."""
    data = await service.generate_slots(
        db,
        user,
        professional_id,
        start_date=body.start_date,
        end_date=body.end_date,
        slot_duration_minutes=body.slot_duration_minutes,
    )
    return {"success": True, "data": {"slots": data}}


@router.get("/{professional_id}")
async def list_open_slots(
    professional_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List a professional's open (unbooked) time slots (public)."""
    data = await service.list_open_slots(db, professional_id)
    return {"success": True, "data": {"slots": data}}
