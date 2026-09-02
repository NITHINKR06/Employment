"""Categories persistence operations."""

from sqlalchemy import func as sa_func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.categories.models import Category
from app.modules.professionals.models import Professional


async def find_by_id(db: AsyncSession, category_id: str) -> Category | None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def find_by_name(db: AsyncSession, name: str) -> Category | None:
    result = await db.execute(select(Category).where(Category.name == name))
    return result.scalar_one_or_none()


async def create(db: AsyncSession, name: str) -> Category:
    category = Category(name=name)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def find_or_create_by_name(db: AsyncSession, name: str) -> Category:
    category = await find_by_name(db, name)
    if category is None:
        category = await create(db, name)
    return category


async def find_all_with_counts(db: AsyncSession) -> list[tuple[Category, int]]:
    """List every category with its professional count — zero-count categories included."""
    stmt = (
        select(Category, sa_func.count(Professional.id))
        .outerjoin(Professional, Professional.category_id == Category.id)
        .group_by(Category.id)
        .order_by(Category.name)
    )
    result = await db.execute(stmt)
    return [(category, count) for category, count in result.all()]
