"""Review-response business logic — a professional's one reply to a review of them."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.reviews import repository as reviews_repository
from app.modules.reviews.service import to_public_shape
from app.modules.users.models import User


async def respond_to_review(db: AsyncSession, user: User, review_id: str, *, response: str) -> dict:
    review = await reviews_repository.find_by_id(db, review_id)
    if review is None:
        raise NotFoundError("Review not found")

    if review.booking.professional.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError("Only the reviewed professional can respond to this review")

    if review.professional_response is not None:
        raise ValidationError("This review has already been responded to")

    updated = await reviews_repository.add_response(db, review, response)
    return to_public_shape(updated)
