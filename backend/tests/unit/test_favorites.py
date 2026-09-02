"""Tests for modules/favorites — toggle/list."""

import pytest
from sqlalchemy.exc import IntegrityError

from app.core.errors import NotFoundError
from app.modules.favorites import repository, service
from app.modules.favorites.models import Favorite
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_toggling_twice_is_idempotent(db, make_user, make_professional):
    user = await make_user()
    pro = await make_professional()

    first = await service.toggle_favorite(db, user, pro.id)
    assert first["favorited"] is True

    second = await service.toggle_favorite(db, user, pro.id)
    assert second["favorited"] is False


@pytest.mark.asyncio
async def test_list_mine_only_returns_callers_favorites(db, make_user, make_professional):
    user = await make_user()
    other_user = await make_user()
    pro = await make_professional()

    await service.toggle_favorite(db, user, pro.id)
    await service.toggle_favorite(db, other_user, pro.id)

    mine = await service.list_favorites(db, user)
    assert len(mine) == 1
    assert mine[0]["id"] == pro.id


@pytest.mark.asyncio
async def test_favoriting_same_professional_twice_is_rejected_by_unique_constraint(
    db, make_user, make_professional
):
    user = await make_user()
    pro = await make_professional()

    await repository.create(db, user.id, pro.id)

    with pytest.raises(IntegrityError):
        db.add(Favorite(user_id=user.id, professional_id=pro.id))
        await db.commit()


@pytest.mark.asyncio
async def test_toggle_raises_not_found_for_unknown_professional(db, make_user):
    user = await make_user()
    with pytest.raises(NotFoundError):
        await service.toggle_favorite(db, user, "nonexistent-id")
