"""Tests for modules/geocoding — throttled Nominatim client, clean not-found handling,
and the professionals bounding-box filter."""

from unittest.mock import AsyncMock

import pytest

from app.core.errors import NotFoundError
from app.modules.geocoding import service
from app.modules.geocoding.client import NominatimClient
from app.modules.professionals import service as professionals_service


class FakeClock:
    """A controllable monotonic clock paired with a sleep that just advances it."""

    def __init__(self):
        self.time = 0.0
        self.sleep_calls: list[float] = []

    def now(self) -> float:
        return self.time

    async def sleep(self, seconds: float) -> None:
        self.sleep_calls.append(seconds)
        self.time += seconds


@pytest.mark.asyncio
async def test_client_throttles_burst_to_at_most_one_per_second():
    clock = FakeClock()
    client = NominatimClient(min_interval=1.0, clock=clock.now, sleep=clock.sleep)
    client._fetch = AsyncMock(return_value=[{"lat": "1.0", "lon": "2.0", "display_name": "X"}])

    request_times: list[float] = []
    for _ in range(5):
        await client.geocode("123 Test St")
        request_times.append(clock.time)

    # No burst: every recorded request is spaced by at least the min interval.
    for earlier, later in zip(request_times, request_times[1:]):
        assert later - earlier >= 1.0 - 1e-9


@pytest.mark.asyncio
async def test_malformed_or_unresolvable_address_returns_clean_not_found():
    clock = FakeClock()
    client = NominatimClient(min_interval=0.0, clock=clock.now, sleep=clock.sleep)
    client._fetch = AsyncMock(return_value=[])

    with pytest.raises(NotFoundError):
        await service.geocode_address("not a real place", client=client)


@pytest.mark.asyncio
async def test_unparseable_result_returns_clean_not_found_not_an_exception():
    clock = FakeClock()
    client = NominatimClient(min_interval=0.0, clock=clock.now, sleep=clock.sleep)
    client._fetch = AsyncMock(return_value=[{"lat": "not-a-number", "lon": "2.0"}])

    with pytest.raises(NotFoundError):
        await service.geocode_address("weird result", client=client)


@pytest.mark.asyncio
async def test_bounding_box_filter_excludes_out_of_range_professionals(db, make_professional):
    inside = await make_professional(latitude=40.0, longitude=-74.0)
    outside = await make_professional(latitude=51.5, longitude=-0.1)

    result = await professionals_service.list_professionals(
        db, min_lat=39.0, max_lat=41.0, min_lng=-75.0, max_lng=-73.0
    )

    ids = {p["id"] for p in result}
    assert inside.id in ids
    assert outside.id not in ids
