"""Admin dispute/verification management — thin delegation, never touches
`disputes`/`verification` repositories directly."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.disputes import service as disputes_service
from app.modules.users.models import User
from app.modules.verification import service as verification_service


async def list_all_disputes(db: AsyncSession, admin_user: User) -> list[dict]:
    return await disputes_service.list_all_disputes(db, admin_user)


async def resolve_dispute(db: AsyncSession, admin_user: User, dispute_id: str, *, resolution: str) -> dict:
    return await disputes_service.update_dispute_status(
        db, admin_user, dispute_id, status="RESOLVED", resolution=resolution
    )


async def list_pending_verification_requests(db: AsyncSession, admin_user: User) -> list[dict]:
    return await verification_service.list_pending_requests(db, admin_user)


async def approve_verification(db: AsyncSession, admin_user: User, request_id: str) -> dict:
    return await verification_service.approve_request(db, admin_user, request_id)


async def reject_verification(db: AsyncSession, admin_user: User, request_id: str) -> dict:
    return await verification_service.reject_request(db, admin_user, request_id)
