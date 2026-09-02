"""Portfolio business logic — add/remove/reorder images, ownership checks.

Depends on Phase 8's `uploads` module for real file storage; interim: raw URLs.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError, NotFoundError, ValidationError
from app.modules.portfolio import repository
from app.modules.professionals import repository as professionals_repository
from app.modules.professionals.models import PortfolioImage
from app.modules.users.models import User


def _to_shape(image: PortfolioImage) -> dict:
    return {"id": image.id, "url": image.url, "position": image.position}


async def _assert_owner(db: AsyncSession, user: User, professional_id: str) -> None:
    professional = await professionals_repository.find_by_id(db, professional_id)
    if professional is None:
        raise NotFoundError("Professional not found")
    if professional.user_id != user.id and user.role.value != "ADMIN":
        raise ForbiddenError("Only the owning professional can manage this portfolio")


async def add_image(db: AsyncSession, user: User, professional_id: str, url: str) -> list[dict]:
    await _assert_owner(db, user, professional_id)
    existing = await repository.find_many_for_professional(db, professional_id)
    await repository.create(db, professional_id=professional_id, url=url, position=len(existing))
    images = await repository.find_many_for_professional(db, professional_id)
    return [_to_shape(i) for i in images]


async def remove_image(db: AsyncSession, user: User, professional_id: str, image_id: str) -> list[dict]:
    await _assert_owner(db, user, professional_id)
    image = await repository.find_by_id(db, image_id)
    if image is None or image.professional_id != professional_id:
        raise NotFoundError("Portfolio image not found")

    await repository.delete(db, image)
    images = await repository.find_many_for_professional(db, professional_id)
    return [_to_shape(i) for i in images]


async def reorder_images(
    db: AsyncSession, user: User, professional_id: str, ordered_ids: list[str]
) -> list[dict]:
    await _assert_owner(db, user, professional_id)
    images = await repository.find_many_for_professional(db, professional_id)

    if sorted(ordered_ids) != sorted(image.id for image in images):
        raise ValidationError("ordered_ids must be exactly the professional's current image ids")

    await repository.reorder(db, images, ordered_ids)
    reordered = await repository.find_many_for_professional(db, professional_id)
    return [_to_shape(i) for i in reordered]


async def list_images(db: AsyncSession, professional_id: str) -> list[dict]:
    images = await repository.find_many_for_professional(db, professional_id)
    return [_to_shape(i) for i in images]
