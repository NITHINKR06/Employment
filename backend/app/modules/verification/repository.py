"""Verification request persistence operations."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.modules.verification.models import VerificationRequest, VerificationStatus


async def create(db: AsyncSession, *, professional_id: str, notes: str | None) -> VerificationRequest:
    request = VerificationRequest(professional_id=professional_id, notes=notes)
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


async def find_by_id(db: AsyncSession, request_id: str) -> VerificationRequest | None:
    stmt = (
        select(VerificationRequest)
        .options(joinedload(VerificationRequest.professional))
        .where(VerificationRequest.id == request_id)
    )
    result = await db.execute(stmt)
    return result.unique().scalar_one_or_none()


async def find_pending(db: AsyncSession) -> list[VerificationRequest]:
    stmt = (
        select(VerificationRequest)
        .options(joinedload(VerificationRequest.professional))
        .where(VerificationRequest.status == VerificationStatus.PENDING)
        .order_by(VerificationRequest.submitted_at)
    )
    result = await db.execute(stmt)
    return list(result.unique().scalars().all())


async def update_status(
    db: AsyncSession, request: VerificationRequest, status: VerificationStatus, reviewed_by: str
) -> VerificationRequest:
    request.status = status
    request.reviewed_by = reviewed_by
    request.reviewed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(request)
    return request
