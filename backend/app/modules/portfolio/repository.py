"""Portfolio image persistence operations — operates on professionals.PortfolioImage."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.professionals.models import PortfolioImage


async def find_many_for_professional(db: AsyncSession, professional_id: str) -> list[PortfolioImage]:
    stmt = (
        select(PortfolioImage)
        .where(PortfolioImage.professional_id == professional_id)
        .order_by(PortfolioImage.position)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def find_by_id(db: AsyncSession, image_id: str) -> PortfolioImage | None:
    result = await db.execute(select(PortfolioImage).where(PortfolioImage.id == image_id))
    return result.scalar_one_or_none()


async def create(db: AsyncSession, *, professional_id: str, url: str, position: int) -> PortfolioImage:
    image = PortfolioImage(professional_id=professional_id, url=url, position=position)
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image


async def delete(db: AsyncSession, image: PortfolioImage) -> None:
    await db.delete(image)
    await db.commit()


async def reorder(db: AsyncSession, images: list[PortfolioImage], ordered_ids: list[str]) -> None:
    by_id = {image.id: image for image in images}
    for position, image_id in enumerate(ordered_ids):
        by_id[image_id].position = position
    await db.commit()
