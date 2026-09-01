"""Users repository — the only place that touches the User table."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User


async def find_by_id(db: AsyncSession, user_id: str) -> User | None:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def find_by_firebase_uid(db: AsyncSession, firebase_uid: str) -> User | None:
    stmt = select(User).where(User.firebase_uid == firebase_uid)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def upsert_on_login(
    db: AsyncSession,
    *,
    firebase_uid: str,
    email: str,
    name: str,
) -> User:
    """Find by firebase_uid; if missing, create with role=USER. Never overwrites role."""
    user = await find_by_firebase_uid(db, firebase_uid)
    if user is not None:
        return user

    user = User(firebase_uid=firebase_uid, email=email, name=name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
