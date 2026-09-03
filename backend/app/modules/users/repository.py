"""Users repository — the only place that touches the User table."""

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import Role, User


async def find_many(db: AsyncSession, *, search: str | None = None) -> list[User]:
    stmt = select(User)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
    stmt = stmt.order_by(User.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def set_active(db: AsyncSession, user: User, is_active: bool) -> User:
    user.is_active = is_active
    await db.commit()
    await db.refresh(user)
    return user


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
    role: Role = Role.USER,
) -> User:
    """Find by firebase_uid; if missing, create with the given role (defaults to
    USER). `role` only ever applies to that first creation — an existing user's
    role is never touched here, by design (this is not a privilege-escalation path)."""
    user = await find_by_firebase_uid(db, firebase_uid)
    if user is not None:
        return user

    user = User(firebase_uid=firebase_uid, email=email, name=name, role=role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update(db: AsyncSession, user: User, data: dict) -> User:
    """Persist the supplied account fields for an already authenticated user."""
    for key, value in data.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user
