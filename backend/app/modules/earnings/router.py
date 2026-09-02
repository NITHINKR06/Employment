"""Earnings router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.earnings import service
from app.modules.users.models import User

router = APIRouter(prefix="/earnings", tags=["earnings"])


@router.get("")
async def get_earnings_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.get_earnings_summary(db, user)
    return {"success": True, "data": data}
