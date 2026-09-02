"""Verification business logic — submit + admin approve/reject."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.professionals import repository as professionals_repository
from app.modules.users.models import User
from app.modules.verification import repository
from app.modules.verification.models import VerificationRequest, VerificationStatus


def _to_shape(request: VerificationRequest) -> dict:
    return {
        "id": request.id,
        "professionalId": request.professional_id,
        "status": request.status.value,
        "notes": request.notes,
        "reviewedBy": request.reviewed_by,
        "reviewedAt": request.reviewed_at.isoformat() if request.reviewed_at else None,
        "submittedAt": request.submitted_at.isoformat() if request.submitted_at else None,
    }


async def submit_verification_request(db: AsyncSession, user: User, *, notes: str | None = None) -> dict:
    professional = await professionals_repository.find_by_user_id(db, user.id)
    if professional is None:
        raise ForbiddenError("You must have a professional profile to request verification")

    request = await repository.create(db, professional_id=professional.id, notes=notes)
    return _to_shape(request)


async def approve_request(db: AsyncSession, admin_user: User, request_id: str) -> dict:
    if admin_user.role.value != "ADMIN":
        raise ForbiddenError()

    request = await repository.find_by_id(db, request_id)
    if request is None:
        raise NotFoundError("Verification request not found")
    if request.status != VerificationStatus.PENDING:
        raise ValidationError("This request has already been reviewed")

    updated = await repository.update_status(db, request, VerificationStatus.APPROVED, admin_user.id)
    await professionals_repository.set_verified(db, request.professional_id, True)
    return _to_shape(updated)


async def reject_request(db: AsyncSession, admin_user: User, request_id: str) -> dict:
    if admin_user.role.value != "ADMIN":
        raise ForbiddenError()

    request = await repository.find_by_id(db, request_id)
    if request is None:
        raise NotFoundError("Verification request not found")
    if request.status != VerificationStatus.PENDING:
        raise ValidationError("This request has already been reviewed")

    updated = await repository.update_status(db, request, VerificationStatus.REJECTED, admin_user.id)
    return _to_shape(updated)
