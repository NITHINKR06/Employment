"""SMS gateway client — talks to a self-hosted/open-source SMS gateway over HTTP.

No paid provider (Twilio etc.) is used, per the Phase 4 scope. A gateway
failure is always caught here and reported as a boolean — it must never
propagate up and break the booking/contact flow that triggered the message.
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class SmsGatewayClient:
    def __init__(self, *, gateway_url: str | None = None, api_key: str | None = None):
        self._gateway_url = gateway_url if gateway_url is not None else settings.sms_gateway_url
        self._api_key = api_key if api_key is not None else settings.sms_gateway_api_key

    async def _post(self, to: str, message: str) -> None:
        async with httpx.AsyncClient(timeout=5.0) as http_client:
            response = await http_client.post(
                self._gateway_url,
                json={"to": to, "message": message},
                headers={"Authorization": f"Bearer {self._api_key}"} if self._api_key else {},
            )
            response.raise_for_status()

    async def send(self, to: str, message: str) -> bool:
        """Send an SMS. Returns True on success, False on any failure — never raises."""
        if not self._gateway_url:
            logger.info("SMS gateway not configured; skipping send to %s", to)
            return False

        try:
            await self._post(to, message)
            return True
        except httpx.HTTPError as exc:
            logger.warning("SMS gateway send to %s failed: %s", to, exc)
            return False


_client: SmsGatewayClient | None = None


def get_client() -> SmsGatewayClient:
    global _client
    if _client is None:
        _client = SmsGatewayClient()
    return _client
