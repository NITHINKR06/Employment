"""Bookings router — parse request → call service → return response."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.bookings import service
from app.modules.bookings.schemas import CreateBookingRequest, UpdateBookingStatusRequest
from app.modules.users.models import User

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", status_code=201)
async def create_booking(
    body: CreateBookingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump(by_alias=False)
    result = await service.create_booking(db, user, data)
    return {"success": True, "data": result}


@router.get("")
async def list_my_bookings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.list_my_bookings(db, user)
    return {"success": True, "data": data}


@router.get("/summary")
async def get_employee_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.get_employee_summary(db, user)
    return {"success": True, "data": data}


@router.get("/{booking_id}")
async def get_booking(
    booking_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.get_booking_by_id(db, user, booking_id)
    return {"success": True, "data": data}


@router.patch("/{booking_id}")
async def update_booking_status(
    booking_id: str,
    body: UpdateBookingStatusRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.update_booking_status(db, user, booking_id, body.status)
    return {"success": True, "data": data}
