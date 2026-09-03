"""Users service — business logic only, no raw queries."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.modules.users import repository
from app.modules.users.models import Role, User

# Only these roles are ever choosable by a user at signup — ADMIN is never
# settable through this path, it's granted out-of-band (see the admin panel's
# own onboarding, which has no self-serve path by design).
SELF_SERVE_ROLES = {"USER", "EMPLOYEE"}


async def get_or_create_user(
    db: AsyncSession,
    *,
    firebase_uid: str,
    email: str,
    name: str,
    role: str | None = None,
) -> User:
    """Upsert-on-login. `role` (USER or EMPLOYEE only) only ever applies the
    first time this firebase_uid is seen — an existing account's role is
    never changed by a later call, so this can't be used to self-promote."""
    desired_role = Role(role) if role in SELF_SERVE_ROLES else Role.USER
    return await repository.upsert_on_login(
        db, firebase_uid=firebase_uid, email=email, name=name, role=desired_role
    )


async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
    user = await repository.find_by_id(db, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


async def update_user(db: AsyncSession, user: User, data: dict) -> User:
    return await repository.update(db, user, data)


async def list_users(db: AsyncSession, *, search: str | None = None) -> list[User]:
    return await repository.find_many(db, search=search)


async def suspend_user(db: AsyncSession, user_id: str) -> User:
    user = await get_user_by_id(db, user_id)
    return await repository.set_active(db, user, False)


async def unsuspend_user(db: AsyncSession, user_id: str) -> User:
    user = await get_user_by_id(db, user_id)
    return await repository.set_active(db, user, True)
