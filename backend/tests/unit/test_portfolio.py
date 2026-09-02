"""Tests for modules/portfolio — add/remove/reorder, ownership checks."""

import pytest

from app.core.errors import ForbiddenError
from app.modules.portfolio import service
from app.modules.users.models import Role


@pytest.mark.asyncio
async def test_only_owning_professional_can_add_remove_reorder(db, make_user, make_professional):
    owner = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=owner)
    outsider = await make_user(role=Role.USER)

    images = await service.add_image(db, owner, pro.id, "https://example.com/a.jpg")
    assert len(images) == 1

    with pytest.raises(ForbiddenError):
        await service.add_image(db, outsider, pro.id, "https://example.com/b.jpg")
    with pytest.raises(ForbiddenError):
        await service.remove_image(db, outsider, pro.id, images[0]["id"])
    with pytest.raises(ForbiddenError):
        await service.reorder_images(db, outsider, pro.id, [images[0]["id"]])


@pytest.mark.asyncio
async def test_reorder_persists_and_list_reflects_it(db, make_user, make_professional):
    owner = await make_user(role=Role.EMPLOYEE)
    pro = await make_professional(user=owner)

    await service.add_image(db, owner, pro.id, "https://example.com/a.jpg")
    await service.add_image(db, owner, pro.id, "https://example.com/b.jpg")
    images = await service.add_image(db, owner, pro.id, "https://example.com/c.jpg")
    ids_in_order = [i["id"] for i in images]

    reversed_order = list(reversed(ids_in_order))
    await service.reorder_images(db, owner, pro.id, reversed_order)

    listed = await service.list_images(db, pro.id)
    assert [i["id"] for i in listed] == reversed_order
