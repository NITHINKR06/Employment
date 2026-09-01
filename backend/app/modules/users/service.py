"""Users service — business logic only, no raw queries."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.modules.users import repository
from app.modules.users.models import User


async def get_or_create_user(
    db: AsyncSession,
    *,
    firebase_uid: str,
    email: str,
    name: str,
) -> User:
    """Upsert-on-login: creates with role=USER on first visit, returns existing otherwise."""
    return await repository.upsert_on_login(
        db, firebase_uid=firebase_uid, email=email, name=name
    )


async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
    user = await repository.find_by_id(db, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


async def update_user(db: AsyncSession, user: User, data: dict) -> User:
    return await repository.update(db, user, data)
