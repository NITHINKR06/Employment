"""Admin router — every route is require_role("ADMIN")-gated."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import require_role
from app.modules.admin import analytics_service, dispute_service, user_service
from app.modules.admin.schemas import ResolveDisputeRequest
from app.modules.users.models import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    search: str | None = Query(None),
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await user_service.list_users(db, user, search=search)
    return {"success": True, "data": {"users": data}}


@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await user_service.suspend_user(db, user, user_id)
    return {"success": True, "data": {"user": data}}


@router.post("/users/{user_id}/unsuspend")
async def unsuspend_user(
    user_id: str,
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await user_service.unsuspend_user(db, user, user_id)
    return {"success": True, "data": {"user": data}}


@router.get("/analytics")
async def get_platform_analytics(
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await analytics_service.get_platform_analytics(db, user)
    return {"success": True, "data": data}


@router.get("/disputes")
async def list_all_disputes(
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await dispute_service.list_all_disputes(db, user)
    return {"success": True, "data": {"disputes": data}}


@router.post("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: str,
    body: ResolveDisputeRequest,
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await dispute_service.resolve_dispute(db, user, dispute_id, resolution=body.resolution)
    return {"success": True, "data": {"dispute": data}}


@router.get("/verification")
async def list_pending_verification_requests(
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await dispute_service.list_pending_verification_requests(db, user)
    return {"success": True, "data": {"verificationRequests": data}}


@router.post("/verification/{request_id}/approve")
async def approve_verification(
    request_id: str,
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await dispute_service.approve_verification(db, user, request_id)
    return {"success": True, "data": {"verificationRequest": data}}


@router.post("/verification/{request_id}/reject")
async def reject_verification(
    request_id: str,
    user: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    data = await dispute_service.reject_verification(db, user, request_id)
    return {"success": True, "data": {"verificationRequest": data}}
