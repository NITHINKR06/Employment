"""Tests for modules/categories — list-with-counts."""

import pytest

from app.modules.categories import repository, service
from app.modules.categories.models import Category


@pytest.mark.asyncio
async def test_list_returns_accurate_per_category_counts(db, make_professional):
    plumbing = await repository.create(db, "Plumbing")
    electrical = await repository.create(db, "Electrical")

    await make_professional(trade="Plumbing", category_id=plumbing.id)
    await make_professional(trade="Plumbing", category_id=plumbing.id)
    await make_professional(trade="Electrical", category_id=electrical.id)

    result = await service.list_categories_with_counts(db)
    counts = {c["name"]: c["count"] for c in result}

    assert counts["Plumbing"] == 2
    assert counts["Electrical"] == 1


@pytest.mark.asyncio
async def test_zero_professional_category_still_appears(db):
    empty_category = await repository.create(db, "Landscaping")

    result = await service.list_categories_with_counts(db)

    assert any(c["id"] == empty_category.id and c["count"] == 0 for c in result)
