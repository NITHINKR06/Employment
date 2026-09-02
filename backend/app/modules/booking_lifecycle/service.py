"""Booking lifecycle business logic — reschedule, recurring bookings, cancellation policy."""

from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.availability import repository as availability_repository
from app.modules.availability import service as availability_service
from app.modules.booking_lifecycle import repository
from app.modules.booking_lifecycle.models import RecurringBooking, RecurringFrequency
from app.modules.bookings import repository as bookings_repository
from app.modules.bookings.models import Booking, BookingStatus
from app.modules.bookings.service import _to_summary_shape
from app.modules.payments import repository as payments_repository
from app.modules.payments import service as payments_service
from app.modules.users.models import User

FREQUENCY_DELTAS: dict[RecurringFrequency, timedelta] = {
    RecurringFrequency.WEEKLY: timedelta(weeks=1),
    RecurringFrequency.BIWEEKLY: timedelta(weeks=2),
    RecurringFrequency.MONTHLY: timedelta(days=30),
}

CANCELLATION_CUTOFF = timedelta(hours=24)


def _assert_participant(booking: Booking, user: User) -> None:
    is_owner = booking.user_id == user.id
    is_professional = booking.professional.user_id == user.id
    if not is_owner and not is_professional and user.role.value != "ADMIN":
        raise ForbiddenError()


def _to_recurring_shape(recurring: RecurringBooking) -> dict:
    return {
        "id": recurring.id,
        "userId": recurring.user_id,
        "professionalId": recurring.professional_id,
        "serviceId": recurring.service_id,
        "address": recurring.address,
        "notes": recurring.notes,
        "frequency": recurring.frequency.value,
        "nextRunAt": recurring.next_run_at.isoformat(),
        "active": recurring.active,
    }


async def reschedule_booking(
    db: AsyncSession, user: User, booking_id: str, new_slot_id: str
) -> dict:
    booking = await bookings_repository.find_by_id(db, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    _assert_participant(booking, user)

    new_slot = await availability_repository.find_by_id(db, new_slot_id)
    if new_slot is None:
        raise NotFoundError("Time slot not found")
    if new_slot.professional_id != booking.professional_id:
        raise ValidationError("That time slot doesn't belong to this booking's professional")

    old_slot = await availability_repository.find_by_booking_id(db, booking_id)

    # Reserving the new slot first is what makes "reschedule onto an
    # already-booked slot" a clean rejection instead of a lost old slot.
    reserved = await availability_service.reserve_slot(db, new_slot_id, booking_id)

    if old_slot is not None:
        await availability_repository.release(db, old_slot.id)

    booking.scheduled_at = reserved.starts_at
    await db.commit()
    updated = await bookings_repository.find_by_id(db, booking_id)
    return _to_summary_shape(updated, user.role.value)  # type: ignore[arg-type]


async def create_recurring_booking(
    db: AsyncSession,
    user: User,
    *,
    professional_id: str,
    service_id: str | None,
    address: str,
    notes: str | None,
    frequency: str,
    starts_at: datetime,
) -> dict:
    recurring = await repository.create(
        db,
        {
            "user_id": user.id,
            "professional_id": professional_id,
            "service_id": service_id,
            "address": address,
            "notes": notes,
            "frequency": RecurringFrequency(frequency),
            "next_run_at": starts_at,
        },
    )
    return _to_recurring_shape(recurring)


async def run_due_recurring_bookings(db: AsyncSession, *, now: datetime | None = None) -> list[dict]:
    """Cron-triggered: create exactly one Booking per due cycle, advance the schedule."""
    now = now or datetime.now(timezone.utc)
    due = await repository.find_due(db, now)

    created: list[dict] = []
    for recurring in due:
        booking = await bookings_repository.create(
            db,
            {
                "user_id": recurring.user_id,
                "professional_id": recurring.professional_id,
                "service_id": recurring.service_id,
                "scheduled_at": recurring.next_run_at,
                "address": recurring.address,
                "notes": recurring.notes,
            },
        )
        created.append(_to_summary_shape(booking, "USER"))
        await repository.advance_next_run(
            db, recurring, recurring.next_run_at + FREQUENCY_DELTAS[recurring.frequency]
        )

    return created


async def cancel_booking_with_policy(db: AsyncSession, user: User, booking_id: str) -> dict:
    """Cancel a booking, enforcing the cutoff window and issuing a mock refund when eligible."""
    booking = await bookings_repository.find_by_id(db, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    _assert_participant(booking, user)

    if booking.status in (BookingStatus.COMPLETED, BookingStatus.CANCELLED):
        raise ValidationError(f"Cannot cancel a {booking.status.value.lower()} booking")

    now = datetime.now(timezone.utc)
    if booking.scheduled_at is not None:
        scheduled_at = booking.scheduled_at
        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)
        if scheduled_at - now < CANCELLATION_CUTOFF:
            raise ValidationError(
                "This booking is inside the 24-hour cancellation window and can no longer be cancelled"
            )

    updated = await bookings_repository.update_status(db, booking_id, BookingStatus.CANCELLED)
    await availability_service.release_slot_for_booking(db, booking_id)

    payment = await payments_repository.find_by_booking_id(db, booking_id)
    if payment is not None and payment.status.value == "PAID":
        await payments_service.refund_payment(db, payment.id)

    return _to_summary_shape(updated, "EMPLOYEE" if updated.professional.user_id == user.id else "USER")  # type: ignore[union-attr]
