"""Verification router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.users.models import User
from app.modules.verification import service
from app.modules.verification.schemas import SubmitVerificationRequest

router = APIRouter(prefix="/verification", tags=["verification"])


@router.post("/requests", status_code=201)
async def submit_verification_request(
    body: SubmitVerificationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.submit_verification_request(db, user, notes=body.notes)
    return {"success": True, "data": {"verificationRequest": data}}


@router.post("/requests/{request_id}/approve")
async def approve_verification_request(
    request_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin-only."""
    data = await service.approve_request(db, user, request_id)
    return {"success": True, "data": {"verificationRequest": data}}


@router.post("/requests/{request_id}/reject")
async def reject_verification_request(
    request_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin-only."""
    data = await service.reject_request(db, user, request_id)
    return {"success": True, "data": {"verificationRequest": data}}
