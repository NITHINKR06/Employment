"""Notification HTTP endpoints."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.notifications import service
from app.modules.users.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"success": True, "data": await service.list_notifications(db, user)}


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"success": True, "data": await service.mark_notification_read(db, user, notification_id)}


@router.delete("", status_code=204)
async def clear_all(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> Response:
    await service.clear_notifications(db, user)
    return Response(status_code=204)
