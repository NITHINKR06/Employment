"""Public geocoding endpoint."""

from fastapi import APIRouter, Query

from app.modules.geocoding import service

router = APIRouter(prefix="/geocoding", tags=["geocoding"])


@router.get("/search")
async def geocode(address: str = Query(min_length=1)):
    """Resolve a free-text address to coordinates (public)."""
    data = await service.geocode_address(address)
    return {"success": True, "data": data}
