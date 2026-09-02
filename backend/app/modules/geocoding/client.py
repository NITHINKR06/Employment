"""Nominatim (OpenStreetMap) geocoding client, throttled to ≤1 request/sec
per Nominatim's usage policy: https://operations.osmfoundation.org/policies/nominatim/
"""

import asyncio
import time
from typing import Awaitable, Callable

import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
MIN_INTERVAL_SECONDS = 1.0


class NominatimClient:
    def __init__(
        self,
        *,
        min_interval: float = MIN_INTERVAL_SECONDS,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], Awaitable[None]] = asyncio.sleep,
    ):
        self._min_interval = min_interval
        self._clock = clock
        self._sleep = sleep
        self._last_request_at: float | None = None
        self._lock = asyncio.Lock()

    async def _throttle(self) -> None:
        async with self._lock:
            now = self._clock()
            if self._last_request_at is not None:
                wait = self._min_interval - (now - self._last_request_at)
                if wait > 0:
                    await self._sleep(wait)
            self._last_request_at = self._clock()

    async def _fetch(self, address: str) -> list[dict]:
        async with httpx.AsyncClient(timeout=5.0) as http_client:
            response = await http_client.get(
                NOMINATIM_URL,
                params={"q": address, "format": "json", "limit": 1},
                headers={"User-Agent": "ProMarket/1.0"},
            )
            response.raise_for_status()
            return response.json()

    async def geocode(self, address: str) -> dict | None:
        """Resolve an address to coordinates, or None if it can't be resolved.

        Never raises on network/parse failure — a malformed or unresolvable
        address is reported as "not found", not an unhandled exception.
        """
        await self._throttle()
        try:
            results = await self._fetch(address)
        except (httpx.HTTPError, ValueError):
            return None

        if not results:
            return None

        try:
            first = results[0]
            return {
                "latitude": float(first["lat"]),
                "longitude": float(first["lon"]),
                "displayName": first.get("display_name"),
            }
        except (KeyError, TypeError, ValueError):
            return None


_client: NominatimClient | None = None


def get_client() -> NominatimClient:
    global _client
    if _client is None:
        _client = NominatimClient()
    return _client
