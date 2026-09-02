"""Tests for modules/reviews — creation rules, rating recompute, public listing."""

import pytest

from app.core.errors import ForbiddenError, ValidationError
from app.modules.bookings.models import BookingStatus
from app.modules.reviews import service
from app.modules.professionals import repository as professional_repo
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_review_rejected_if_booking_not_completed(db, make_user, make_professional, make_booking):
    """Review creation rejected if the booking isn't COMPLETED."""
    customer = await make_user(role=Role.USER)
    pro = await make_professional()
    booking = await make_booking(user=customer, professional=pro, status=BookingStatus.PENDING)

    with pytest.raises(ValidationError, match="completed booking"):
        await service.create_review(db, customer, booking.id, rating=5)


@pytest.mark.asyncio
async def test_review_rejected_on_second_attempt(db, make_user, make_professional, make_booking):
    """Review creation rejected on a second attempt for the same booking."""
    customer = await make_user(role=Role.USER)
    pro = await make_professional()
    booking = await make_booking(user=customer, professional=pro, status=BookingStatus.COMPLETED)

    await service.create_review(db, customer, booking.id, rating=4, comment="Good")

    with pytest.raises(ValidationError, match="already been reviewed"):
        await service.create_review(db, customer, booking.id, rating=5)


@pytest.mark.asyncio
async def test_rating_recompute(db, make_user, make_professional, make_booking):
    """rating_avg/review_count recompute correctly after each new review."""
    customer = await make_user(role=Role.USER)
    pro = await make_professional()

    # Review 1: rating=4
    b1 = await make_booking(user=customer, professional=pro, status=BookingStatus.COMPLETED)
    await service.create_review(db, customer, b1.id, rating=4)
    updated_pro = await professional_repo.find_by_id(db, pro.id)
    assert float(updated_pro.rating_avg) == 4.0
    assert updated_pro.review_count == 1

    # Review 2: rating=2 → avg = (4+2)/2 = 3.0
    customer2 = await make_user(role=Role.USER)
    b2 = await make_booking(user=customer2, professional=pro, status=BookingStatus.COMPLETED)
    await service.create_review(db, customer2, b2.id, rating=2)
    await db.refresh(updated_pro)
    updated_pro = await professional_repo.find_by_id(db, pro.id)
    assert float(updated_pro.rating_avg) == 3.0
    assert updated_pro.review_count == 2

    # Review 3: rating=5 → avg = (4+2+5)/3 ≈ 3.67
    customer3 = await make_user(role=Role.USER)
    b3 = await make_booking(user=customer3, professional=pro, status=BookingStatus.COMPLETED)
    await service.create_review(db, customer3, b3.id, rating=5)
    updated_pro = await professional_repo.find_by_id(db, pro.id)
    assert abs(float(updated_pro.rating_avg) - 3.67) < 0.01
    assert updated_pro.review_count == 3


@pytest.mark.asyncio
async def test_list_professional_reviews_is_public(db, make_user, make_professional, make_booking):
    """list_professional_reviews is callable without auth (public endpoint)."""
    customer = await make_user(role=Role.USER)
    pro = await make_professional()
    booking = await make_booking(user=customer, professional=pro, status=BookingStatus.COMPLETED)
    await service.create_review(db, customer, booking.id, rating=5, comment="Great")

    # No user context needed — just call the service with the professional_id
    reviews = await service.list_professional_reviews(db, pro.id)
    assert len(reviews) == 1
    assert reviews[0]["rating"] == 5
    assert reviews[0]["author"] == customer.name
