"""Push subscription router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.push import service
from app.modules.push.schemas import SubscribeRequest, UnsubscribeRequest
from app.modules.users.models import User

router = APIRouter(prefix="/push", tags=["push"])


@router.post("/subscribe", status_code=201)
async def subscribe(
    body: SubscribeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.subscribe(db, user, endpoint=body.endpoint, p256dh=body.p256dh, auth=body.auth)
    return {"success": True, "data": data}


@router.post("/unsubscribe", status_code=204)
async def unsubscribe(
    body: UnsubscribeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await service.unsubscribe(db, user, body.endpoint)
