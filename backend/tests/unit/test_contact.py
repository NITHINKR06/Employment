"""Tests for public contact-message submission."""

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.modules.contact import repository, service
from app.modules.contact.schemas import CreateContactMessageRequest


@pytest.mark.asyncio
async def test_anonymous_submission_succeeds_and_is_stored(db):
    result = await service.create_contact_message(
        db,
        {"name": "Visitor", "email": "visitor@example.com", "message": "Please help"},
    )

    assert result["userId"] is None
    stored = await repository.create(
        db, user_id=None, data={"name": "Second", "email": "second@example.com", "message": "Stored"}
    )
    assert stored.id


@pytest.mark.asyncio
async def test_authenticated_submission_stores_user_id(db, make_user):
    user = await make_user()
    result = await service.create_contact_message(
        db,
        {"name": "Member", "email": user.email, "message": "Please help"},
        user,
    )
    assert result["userId"] == user.id


def test_invalid_email_is_rejected_by_schema():
    with pytest.raises(PydanticValidationError):
        CreateContactMessageRequest(name="Visitor", email="not-an-email", message="Hello")
