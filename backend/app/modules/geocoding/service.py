"""Geocoding business logic."""

from app.core.errors import NotFoundError
from app.modules.geocoding.client import NominatimClient, get_client


async def geocode_address(address: str, *, client: NominatimClient | None = None) -> dict:
    resolved = await (client or get_client()).geocode(address)
    if resolved is None:
        raise NotFoundError("Address could not be resolved")
    return resolved
