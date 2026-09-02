"""Booking lifecycle router — reschedule, policy-aware cancellation, recurring bookings."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user, require_role
from app.modules.booking_lifecycle import service
from app.modules.booking_lifecycle.schemas import (
    CreateRecurringBookingRequest,
    RescheduleBookingRequest,
)
from app.modules.users.models import User

router = APIRouter(prefix="/booking-lifecycle", tags=["booking-lifecycle"])


@router.post("/bookings/{booking_id}/reschedule")
async def reschedule_booking(
    booking_id: str,
    body: RescheduleBookingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.reschedule_booking(db, user, booking_id, body.new_slot_id)
    return {"success": True, "data": {"booking": data}}


@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a booking, enforcing the 24-hour cutoff and a mock refund when eligible."""
    data = await service.cancel_booking_with_policy(db, user, booking_id)
    return {"success": True, "data": {"booking": data}}


@router.post("/recurring", status_code=201)
async def create_recurring_booking(
    body: CreateRecurringBookingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.create_recurring_booking(
        db,
        user,
        professional_id=body.professional_id,
        service_id=body.service_id,
        address=body.address,
        notes=body.notes,
        frequency=body.frequency,
        starts_at=body.starts_at,
    )
    return {"success": True, "data": {"recurringBooking": data}}


@router.post("/recurring/run")
async def run_due_recurring_bookings(
    _admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Cron-triggered: create concrete bookings for every due recurring booking."""
    data = await service.run_due_recurring_bookings(db)
    return {"success": True, "data": {"bookings": data}}
