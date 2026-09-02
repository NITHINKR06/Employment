"""Bookings service — port of booking.service.js.

Status transition table, ownership checks, summary shape — all 1:1 from JS.
"""

from datetime import datetime
from urllib.parse import quote

from sqlalchemy.ext.asyncio import AsyncSession
from ulid import ULID

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.availability import service as availability_service
from app.modules.bookings import repository
from app.modules.bookings.models import Booking, BookingStatus
from app.modules.notifications import service as notifications_service
from app.modules.professionals import repository as professional_repo
from app.modules.sms import service as sms_service
from app.modules.users.models import User

# ── Status transition table (same as JS) ──

ALLOWED_TRANSITIONS: dict[BookingStatus, list[BookingStatus]] = {
    BookingStatus.PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    BookingStatus.CONFIRMED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
    BookingStatus.IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    BookingStatus.COMPLETED: [],
    BookingStatus.CANCELLED: [],
}

STATUS_LABELS: dict[BookingStatus, str] = {
    BookingStatus.PENDING: "Pending",
    BookingStatus.CONFIRMED: "Confirmed",
    BookingStatus.IN_PROGRESS: "In Progress",
    BookingStatus.COMPLETED: "Completed",
    BookingStatus.CANCELLED: "Cancelled",
}


def _avatar_url(name: str) -> str:
    return (
        f"https://ui-avatars.com/api/?name={quote(name)}"
        f"&background=00855d&color=fff&size=128&bold=true"
    )


def _split_scheduled_at(scheduled_at: datetime | None) -> dict:
    if scheduled_at is None:
        return {"date": None, "time": None}
    return {
        "date": scheduled_at.strftime("%Y-%m-%d"),
        "time": scheduled_at.strftime("%-I:%M %p"),
    }


def _to_summary_shape(booking: Booking, viewer_role: str) -> dict:
    """Port of toSummaryShape() from booking.service.js."""
    is_employee_view = viewer_role == "EMPLOYEE"
    counterpart_name = booking.user.name if is_employee_view else booking.professional.user.name
    counterpart_avatar = (
        _avatar_url(booking.user.name) if is_employee_view else booking.professional.avatar
    )
    sched = _split_scheduled_at(booking.scheduled_at)

    return {
        "_id": booking.id,
        "name": counterpart_name,
        "experience": booking.professional.years_experience,
        "status": STATUS_LABELS[booking.status],
        "rating": None if is_employee_view else float(booking.professional.rating_avg),
        "serviceTitle": (
            booking.service.title if booking.service else booking.professional.title
        ),
        "workerAvatar": counterpart_avatar,
        "thumbnail": counterpart_avatar,
        "date": sched["date"],
        "time": sched["time"],
        "address": booking.address,
        "notes": booking.notes,
        "amount": float(booking.payment.amount) if booking.payment else None,
        "paymentStatus": booking.payment.status.value if booking.payment else None,
        "reviewed": booking.review is not None,
    }


def _assert_participant(booking: Booking, user: User) -> dict:
    is_owner = booking.user_id == user.id
    is_professional = booking.professional.user_id == user.id
    if not is_owner and not is_professional and user.role.value != "ADMIN":
        raise ForbiddenError()
    return {"is_owner": is_owner, "is_professional": is_professional}


# ── Public service methods ──


async def create_booking(db: AsyncSession, user: User, data: dict) -> dict:
    professional = await professional_repo.find_by_id(db, data["professional_id"])
    if professional is None:
        raise NotFoundError("Professional not found")

    if data.get("service_id") and not any(
        s.id == data["service_id"] for s in professional.services
    ):
        raise ValidationError("Service does not belong to this professional")

    # Pre-generate the id so a slot reservation (which needs a booking_id) can
    # happen before the Booking row exists — reservation is atomic and, if it
    # fails, nothing about this booking is ever written.
    booking_id = str(ULID())
    scheduled_at = data.get("scheduled_at")
    if data.get("slot_id"):
        slot = await availability_service.reserve_slot(db, data["slot_id"], booking_id)
        scheduled_at = slot.starts_at

    booking = await repository.create(
        db,
        {
            "id": booking_id,
            "user_id": user.id,
            "professional_id": professional.id,
            "service_id": data.get("service_id"),
            "scheduled_at": scheduled_at,
            "address": data.get("address"),
            "notes": data.get("notes"),
        },
    )
    sched = _split_scheduled_at(booking.scheduled_at)
    await sms_service.send_booking_confirmed(
        user.phone, name=user.name, date=sched["date"] or "TBD", time=sched["time"] or "TBD"
    )
    return _to_summary_shape(booking, user.role.value)


async def list_my_bookings(db: AsyncSession, user: User) -> list[dict]:
    if user.role.value == "EMPLOYEE":
        professional = await professional_repo.find_by_user_id(db, user.id)
        if professional is None:
            return []
        bookings = await repository.find_many_by_professional_id(db, professional.id)
        return [_to_summary_shape(b, "EMPLOYEE") for b in bookings]

    bookings = await repository.find_many_by_user_id(db, user.id)
    return [_to_summary_shape(b, "USER") for b in bookings]


async def get_booking_by_id(db: AsyncSession, user: User, booking_id: str) -> dict:
    booking = await repository.find_by_id(db, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    info = _assert_participant(booking, user)
    return _to_summary_shape(booking, "EMPLOYEE" if info["is_professional"] else "USER")


async def get_employee_summary(db: AsyncSession, user: User) -> dict:
    professional = await professional_repo.find_by_user_id(db, user.id)
    if professional is None:
        return {
            "totalJobs": 0,
            "upcomingJobs": 0,
            "completedJobs": 0,
            "cancelledJobs": 0,
            "totalEarnings": 0,
        }

    bookings = await repository.find_many_by_professional_id(db, professional.id)

    active_statuses = {BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS}

    return {
        "totalJobs": len(bookings),
        "upcomingJobs": sum(1 for b in bookings if b.status in active_statuses),
        "completedJobs": sum(1 for b in bookings if b.status == BookingStatus.COMPLETED),
        "cancelledJobs": sum(1 for b in bookings if b.status == BookingStatus.CANCELLED),
        "totalEarnings": sum(
            float(b.payment.amount)
            for b in bookings
            if b.payment and b.payment.status.value == "PAID"
        ),
    }


async def update_booking_status(
    db: AsyncSession, user: User, booking_id: str, status_str: str
) -> dict:
    booking = await repository.find_by_id(db, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")

    info = _assert_participant(booking, user)
    new_status = BookingStatus(status_str)

    # Cancellation: anyone involved can cancel
    if new_status == BookingStatus.CANCELLED:
        if not info["is_owner"] and not info["is_professional"] and user.role.value != "ADMIN":
            raise ForbiddenError()
    else:
        # Non-cancel transitions: only the professional (or admin) can move forward
        if not info["is_professional"] and user.role.value != "ADMIN":
            raise ForbiddenError("Only the assigned professional can update this status")

    allowed = ALLOWED_TRANSITIONS[booking.status]
    if new_status not in allowed:
        raise ValidationError(
            f"Cannot move booking from {booking.status.value} to {new_status.value}"
        )

    updated = await repository.update_status(db, booking_id, new_status)

    await sms_service.send_booking_status_changed(
        updated.user.phone, name=updated.user.name, status=STATUS_LABELS[new_status]
    )

    if new_status == BookingStatus.CANCELLED:
        await availability_service.release_slot_for_booking(db, booking_id)
    elif new_status == BookingStatus.COMPLETED:
        await notifications_service.notify_user(
            db,
            updated.user_id,
            title="Job completed",
            message=f"Your booking with {updated.professional.user.name} is complete. Leave a review!",
        )

    return _to_summary_shape(updated, "EMPLOYEE" if info["is_professional"] else "USER")
