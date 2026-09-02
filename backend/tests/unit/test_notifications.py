"""Tests for in-app notifications."""

import pytest

from app.modules.notifications import service
from app.modules.notifications.models import Notification


@pytest.mark.asyncio
async def test_notify_user_creates_unread_notification(db, make_user):
    user = await make_user()
    result = await service.notify_user(db, user.id, title="Booking", message="Confirmed")

    assert result["readAt"] is None
    assert result["title"] == "Booking"


@pytest.mark.asyncio
async def test_mark_read_is_idempotent(db, make_user):
    user = await make_user()
    item = await service.notify_user(db, user.id, title="Booking", message="Confirmed")

    first = await service.mark_notification_read(db, user, item["id"])
    second = await service.mark_notification_read(db, user, item["id"])

    assert first["readAt"] is not None
    assert second["readAt"] == first["readAt"]


@pytest.mark.asyncio
async def test_clear_only_removes_callers_notifications(db, make_user):
    user = await make_user()
    other = await make_user()
    await service.notify_user(db, user.id, title="One", message="Mine")
    await service.notify_user(db, other.id, title="Two", message="Theirs")

    await service.clear_notifications(db, user)

    assert await service.list_notifications(db, user) == []
    assert len(await service.list_notifications(db, other)) == 1


@pytest.mark.asyncio
async def test_list_returns_only_callers_notifications_newest_first(db, make_user):
    user = await make_user()
    other = await make_user()
    await service.notify_user(db, user.id, title="Older", message="One")
    newest = await service.notify_user(db, user.id, title="Newer", message="Two")
    await service.notify_user(db, other.id, title="Other", message="Three")

    results = await service.list_notifications(db, user)

    assert [item["title"] for item in results] == ["Newer", "Older"]
    assert results[0]["id"] == newest["id"]
