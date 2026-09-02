"""Categories business logic."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.categories import repository


async def list_categories_with_counts(db: AsyncSession) -> list[dict]:
    return [
        {"id": category.id, "name": category.name, "count": count}
        for category, count in await repository.find_all_with_counts(db)
    ]
