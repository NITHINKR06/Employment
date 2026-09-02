"""Tests for modules/review_response — one professional reply per review."""

import pytest

from app.core.errors import ForbiddenError, ValidationError
from app.modules.bookings.models import BookingStatus
from app.modules.review_response import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_only_the_reviewed_professional_can_respond(
    db, make_user, make_professional, make_booking, make_review
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro, status=BookingStatus.COMPLETED)
    review = await make_review(booking=booking)

    other_pro_user = await make_user(role=Role.EMPLOYEE)

    with pytest.raises(ForbiddenError):
        await service.respond_to_review(db, other_pro_user, review.id, response="Thanks!")

    result = await service.respond_to_review(db, pro_user, review.id, response="Thanks for booking!")
    assert result["professionalResponse"] == "Thanks for booking!"


@pytest.mark.asyncio
async def test_second_response_attempt_is_rejected(
    db, make_user, make_professional, make_booking, make_review
):
    pro_user = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=pro_user)
    customer = await make_user(role=Role.USER)
    booking = await make_booking(user=customer, professional=pro, status=BookingStatus.COMPLETED)
    review = await make_review(booking=booking)

    await service.respond_to_review(db, pro_user, review.id, response="First response")

    with pytest.raises(ValidationError):
        await service.respond_to_review(db, pro_user, review.id, response="Second response")
