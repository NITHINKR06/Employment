"""Disputes business logic."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError
from app.modules.bookings import repository as bookings_repository
from app.modules.disputes import repository
from app.modules.disputes.models import Dispute, DisputeStatus
from app.modules.users.models import User


def _to_shape(dispute: Dispute) -> dict:
    return {
        "id": dispute.id,
        "userId": dispute.user_id,
        "bookingId": dispute.booking_id,
        "subject": dispute.subject,
        "description": dispute.description,
        "status": dispute.status.value,
        "resolution": dispute.resolution,
        "resolvedBy": dispute.resolved_by,
        "resolvedAt": dispute.resolved_at.isoformat() if dispute.resolved_at else None,
        "createdAt": dispute.created_at.isoformat() if dispute.created_at else None,
    }


async def create_dispute(
    db: AsyncSession, user: User, *, booking_id: str, subject: str, description: str
) -> dict:
    booking = await bookings_repository.find_by_id(db, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.user_id != user.id and booking.professional.user_id != user.id:
        raise ForbiddenError("You can only dispute your own booking")

    dispute = await repository.create(
        db, user_id=user.id, booking_id=booking_id, subject=subject, description=description
    )
    return _to_shape(dispute)


async def list_my_disputes(db: AsyncSession, user: User) -> list[dict]:
    disputes = await repository.find_many_by_user_id(db, user.id)
    return [_to_shape(d) for d in disputes]


async def get_dispute_by_id(db: AsyncSession, user: User, dispute_id: str) -> dict:
    dispute = await repository.find_by_id(db, dispute_id)
    if dispute is None:
        raise NotFoundError("Dispute not found")
    if dispute.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError()
    return _to_shape(dispute)


async def list_all_disputes(db: AsyncSession, user: User) -> list[dict]:
    """Admin-only. Meant to be delegated from the Phase 7 admin panel."""
    if user.role.value != "ADMIN":
        raise ForbiddenError()
    disputes = await repository.find_all(db)
    return [_to_shape(d) for d in disputes]


async def update_dispute_status(
    db: AsyncSession, user: User, dispute_id: str, *, status: str, resolution: str | None = None
) -> dict:
    """Admin-only. Meant to be delegated from the Phase 7 admin panel."""
    if user.role.value != "ADMIN":
        raise ForbiddenError("Only an admin can change a dispute's status")

    dispute = await repository.find_by_id(db, dispute_id)
    if dispute is None:
        raise NotFoundError("Dispute not found")

    updated = await repository.update_status(
        db, dispute, DisputeStatus(status), resolution=resolution, resolved_by=user.id
    )
    return _to_shape(updated)
