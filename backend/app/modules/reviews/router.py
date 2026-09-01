"""Reviews router — parse request → call service → return response."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.reviews import service
from app.modules.reviews.schemas import CreateReviewRequest
from app.modules.users.models import User

router = APIRouter(tags=["reviews"])


@router.post("/bookings/{booking_id}/reviews", status_code=201)
async def create_review(
    booking_id: str,
    body: CreateReviewRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.create_review(
        db, user, booking_id, rating=body.rating, comment=body.comment
    )
    return {"success": True, "data": data}


@router.get("/professionals/{professional_id}/reviews")
async def list_professional_reviews(
    professional_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List reviews for a professional (public)."""
    data = await service.list_professional_reviews(db, professional_id)
    return {"success": True, "data": data}
