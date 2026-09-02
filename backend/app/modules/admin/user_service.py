"""Admin user management — thin delegation to `users`, never touches its repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError
from app.modules.users import service as users_service
from app.modules.users.models import User


def _assert_admin(admin_user: User) -> None:
    if admin_user.role.value != "ADMIN":
        raise ForbiddenError()


def _to_shape(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role.value,
        "isActive": user.is_active,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


async def list_users(db: AsyncSession, admin_user: User, *, search: str | None = None) -> list[dict]:
    _assert_admin(admin_user)
    users = await users_service.list_users(db, search=search)
    return [_to_shape(u) for u in users]


async def suspend_user(db: AsyncSession, admin_user: User, user_id: str) -> dict:
    _assert_admin(admin_user)
    user = await users_service.suspend_user(db, user_id)
    return _to_shape(user)


async def unsuspend_user(db: AsyncSession, admin_user: User, user_id: str) -> dict:
    _assert_admin(admin_user)
    user = await users_service.unsuspend_user(db, user_id)
    return _to_shape(user)
