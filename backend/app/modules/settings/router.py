"""Current-account settings endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.settings import service
from app.modules.settings.schemas import UpdateSettingsRequest
from app.modules.users.models import User

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
async def get_settings(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"success": True, "data": await service.get_settings(db, user)}


@router.patch("")
async def update_settings(
    body: UpdateSettingsRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.update_settings(db, user, body.model_dump())}
