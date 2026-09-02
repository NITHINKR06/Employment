"""Web Push client — VAPID-signed push, no paid push service.

Uses `pywebpush` lazily (imported inside `send`) so the dependency is only
required in environments that actually send push, not for import/tests.
"""

import json
import logging

from app.core.config import settings
from app.modules.push.models import PushSubscription

logger = logging.getLogger(__name__)


class PushSubscriptionGone(Exception):
    """Raised when the push service reports the subscription no longer exists (HTTP 410)."""


class WebPushClient:
    async def send(self, subscription: PushSubscription, *, title: str, message: str) -> None:
        """Deliver a push notification. Raises PushSubscriptionGone on a 410
        (caller should prune it); any other failure is caught and logged."""
        from pywebpush import WebPushException, webpush  # lazy import

        try:
            webpush(
                subscription_info={
                    "endpoint": subscription.endpoint,
                    "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth},
                },
                data=json.dumps({"title": title, "body": message}),
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": settings.vapid_subject},
            )
        except WebPushException as exc:
            status_code = getattr(exc.response, "status_code", None)
            if status_code == 410:
                raise PushSubscriptionGone() from exc
            logger.warning("Push send to %s failed: %s", subscription.endpoint, exc)


_client: WebPushClient | None = None


def get_client() -> WebPushClient:
    global _client
    if _client is None:
        _client = WebPushClient()
    return _client
