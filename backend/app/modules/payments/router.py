"""Payments router — parse request → call service → return response."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.payments import service
from app.modules.payments.schemas import CreatePaymentRequest
from app.modules.users.models import User

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", status_code=201)
async def create_payment(
    body: CreatePaymentRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.pay_for_booking(
        db,
        user,
        booking_id=body.booking_id,
        amount=body.amount,
        method=body.method,
    )
    return {"success": True, "data": data}


@router.get("/{payment_id}")
async def get_payment(
    payment_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.get_payment_by_id(db, user, payment_id)
    return {"success": True, "data": data}
