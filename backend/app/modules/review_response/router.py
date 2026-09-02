"""Review-response router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.review_response import service
from app.modules.review_response.schemas import RespondToReviewRequest
from app.modules.users.models import User

router = APIRouter(prefix="/reviews", tags=["review-response"])


@router.post("/{review_id}/response", status_code=201)
async def respond_to_review(
    review_id: str,
    body: RespondToReviewRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.respond_to_review(db, user, review_id, response=body.response)
    return {"success": True, "data": {"review": data}}
