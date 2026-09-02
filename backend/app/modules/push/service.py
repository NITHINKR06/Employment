"""Push subscription business logic — subscribe/unsubscribe, fan-out."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.push import repository
from app.modules.push.client import PushSubscriptionGone, get_client
from app.modules.users.models import User


def _to_shape(subscription) -> dict:
    return {"id": subscription.id, "endpoint": subscription.endpoint}


async def subscribe(db: AsyncSession, user: User, *, endpoint: str, p256dh: str, auth: str) -> dict:
    """Idempotent: subscribing the same endpoint again returns the existing row."""
    existing = await repository.find_by_user_and_endpoint(db, user.id, endpoint)
    if existing is not None:
        return _to_shape(existing)
    created = await repository.create(db, user_id=user.id, endpoint=endpoint, p256dh=p256dh, auth=auth)
    return _to_shape(created)


async def unsubscribe(db: AsyncSession, user: User, endpoint: str) -> None:
    await repository.delete_by_user_and_endpoint(db, user.id, endpoint)


async def fan_out_to_user(db: AsyncSession, user_id: str, *, title: str, message: str) -> None:
    """Send a push to every active subscription for this user.

    An expired/invalid subscription (410) is pruned here and never retried;
    any other per-subscription failure is swallowed by the client.
    """
    subscriptions = await repository.find_many_for_user(db, user_id)
    client = get_client()
    for subscription in subscriptions:
        try:
            await client.send(subscription, title=title, message=message)
        except PushSubscriptionGone:
            await repository.delete_by_id(db, subscription.id)
