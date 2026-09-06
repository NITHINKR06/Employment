"""Availability business logic — generate/list/reserve/release time slots."""

from datetime import date, datetime, time, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, ForbiddenError, NotFoundError
from app.modules.availability import repository
from app.modules.availability.models import TimeSlot
from app.modules.professionals import repository as professionals_repository
from app.modules.users.models import User


def _to_shape(slot: TimeSlot) -> dict:
    return {
        "id": slot.id,
        "professionalId": slot.professional_id,
        "startsAt": slot.starts_at.isoformat(),
        "endsAt": slot.ends_at.isoformat(),
        "isBooked": slot.is_booked,
    }


async def generate_slots(
    db: AsyncSession,
    user: User,
    professional_id: str,
    *,
    start_date: date,
    end_date: date,
    slot_duration_minutes: int = 60,
    start_hour: int = 9,
    end_hour: int = 17,
) -> list[dict]:
    professional = await professionals_repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    if professional.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError()

    windows: list[tuple[datetime, datetime]] = []
    current_day = start_date
    duration = timedelta(minutes=slot_duration_minutes)
    while current_day <= end_date:
        cursor = datetime.combine(current_day, time(hour=start_hour))
        day_end = datetime.combine(current_day, time(hour=end_hour))
        while cursor + duration <= day_end:
            windows.append((cursor, cursor + duration))
            cursor += duration
        current_day += timedelta(days=1)

    slots = await repository.create_many(db, professional_id, windows)
    return [_to_shape(s) for s in slots]


async def list_open_slots(db: AsyncSession, professional_id: str) -> list[dict]:
    slots = await repository.find_open_slots(db, professional_id)
    return [_to_shape(s) for s in slots]


async def delete_open_slots(db: AsyncSession, user: User, professional_id: str) -> int:
    professional = await professionals_repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    if professional.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError()
    return await repository.delete_open_slots(db, professional_id)


async def reserve_slot(db: AsyncSession, slot_id: str, booking_id: str) -> TimeSlot:
    slot = await repository.find_by_id(db, slot_id)
    if slot is None:
        raise NotFoundError("Time slot not found")
    reserved = await repository.reserve(db, slot_id, booking_id)
    if not reserved:
        raise ConflictError("This time slot has already been booked")
    return await repository.find_by_id(db, slot_id)  # type: ignore[return-value]


async def release_slot_for_booking(db: AsyncSession, booking_id: str) -> None:
    await repository.release_by_booking_id(db, booking_id)
