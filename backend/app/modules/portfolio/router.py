"""Portfolio router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.portfolio import service
from app.modules.portfolio.schemas import AddPortfolioImageRequest, ReorderPortfolioRequest
from app.modules.users.models import User

router = APIRouter(prefix="/professionals/{professional_id}/portfolio", tags=["portfolio"])


@router.get("")
async def list_portfolio_images(professional_id: str, db: AsyncSession = Depends(get_db)):
    data = await service.list_images(db, professional_id)
    return {"success": True, "data": {"images": data}}


@router.post("", status_code=201)
async def add_portfolio_image(
    professional_id: str,
    body: AddPortfolioImageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.add_image(db, user, professional_id, body.url)
    return {"success": True, "data": {"images": data}}


@router.delete("/{image_id}")
async def remove_portfolio_image(
    professional_id: str,
    image_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.remove_image(db, user, professional_id, image_id)
    return {"success": True, "data": {"images": data}}


@router.put("/order")
async def reorder_portfolio_images(
    professional_id: str,
    body: ReorderPortfolioRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await service.reorder_images(db, user, professional_id, body.ordered_ids)
    return {"success": True, "data": {"images": data}}
