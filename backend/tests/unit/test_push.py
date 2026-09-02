"""Tests for modules/push — subscribe/unsubscribe, fan-out, pruning."""

from unittest.mock import AsyncMock

import pytest

from app.modules.push import repository, service
from app.modules.push.client import PushSubscriptionGone


@pytest.mark.asyncio
async def test_subscribe_stores_one_row_per_unique_endpoint_per_user(db, make_user):
    user = await make_user()

    await service.subscribe(db, user, endpoint="https://push.example/a", p256dh="p1", auth="a1")
    await service.subscribe(db, user, endpoint="https://push.example/a", p256dh="p1", auth="a1")

    subscriptions = await repository.find_many_for_user(db, user.id)
    assert len(subscriptions) == 1


@pytest.mark.asyncio
async def test_unsubscribe_removes_only_the_matching_endpoint(db, make_user):
    user = await make_user()
    await service.subscribe(db, user, endpoint="https://push.example/a", p256dh="p1", auth="a1")
    await service.subscribe(db, user, endpoint="https://push.example/b", p256dh="p2", auth="a2")

    await service.unsubscribe(db, user, "https://push.example/a")

    remaining = await repository.find_many_for_user(db, user.id)
    assert [s.endpoint for s in remaining] == ["https://push.example/b"]


@pytest.mark.asyncio
async def test_notify_fans_out_to_all_active_subscriptions(db, make_user, monkeypatch):
    user = await make_user()
    await service.subscribe(db, user, endpoint="https://push.example/a", p256dh="p1", auth="a1")
    await service.subscribe(db, user, endpoint="https://push.example/b", p256dh="p2", auth="a2")

    fake_client = AsyncMock()
    monkeypatch.setattr(service, "get_client", lambda: fake_client)

    await service.fan_out_to_user(db, user.id, title="Hi", message="There")

    assert fake_client.send.await_count == 2


@pytest.mark.asyncio
async def test_expired_subscription_is_pruned_not_retried(db, make_user, monkeypatch):
    user = await make_user()
    await service.subscribe(db, user, endpoint="https://push.example/gone", p256dh="p1", auth="a1")

    async def fake_send(subscription, *, title, message):
        raise PushSubscriptionGone()

    fake_client = AsyncMock()
    fake_client.send = fake_send
    monkeypatch.setattr(service, "get_client", lambda: fake_client)

    await service.fan_out_to_user(db, user.id, title="Hi", message="There")

    remaining = await repository.find_many_for_user(db, user.id)
    assert remaining == []
