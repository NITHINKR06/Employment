"""Reviews service — port of review.service.js."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.bookings import repository as booking_repo
from app.modules.bookings.models import BookingStatus
from app.modules.professionals import repository as professional_repo
from app.modules.reviews import repository
from app.modules.reviews.models import Review
from app.modules.users.models import User


def _to_public_shape(review: Review) -> dict:
    """Port of toPublicShape() from review.service.js."""
    return {
        "id": review.id,
        "author": review.booking.user.name,
        "rating": review.rating,
        "comment": review.comment,
        "createdAt": review.created_at.isoformat() if review.created_at else None,
    }


async def create_review(
    db: AsyncSession,
    user: User,
    booking_id: str,
    *,
    rating: int,
    comment: str | None = None,
) -> dict:
    """Create a review for a completed booking, recompute professional's rating.

    Port of review.service.js createReview().
    """
    booking = await booking_repo.find_by_id(db, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.user_id != user.id:
        raise ForbiddenError("This booking does not belong to you")
    if booking.status != BookingStatus.COMPLETED:
        raise ValidationError("You can only review a completed booking")

    existing = await repository.find_by_booking_id(db, booking_id)
    if existing:
        raise ValidationError("This booking has already been reviewed")

    await repository.create(db, booking_id=booking_id, rating=rating, comment=comment)

    # Recompute professional's cached rating
    agg = await repository.aggregate_for_professional(db, booking.professional_id)
    await professional_repo.update_rating(
        db, booking.professional_id, agg["avg"], agg["count"]
    )

    # Return the freshly created review
    reviews = await repository.find_many_by_professional_id(db, booking.professional_id)
    return _to_public_shape(reviews[0])


async def list_professional_reviews(db: AsyncSession, professional_id: str) -> list[dict]:
    """List reviews for a professional (public, no auth required)."""
    reviews = await repository.find_many_by_professional_id(db, professional_id)
    return [_to_public_shape(r) for r in reviews]
