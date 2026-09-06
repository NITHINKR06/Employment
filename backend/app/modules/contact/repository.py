"""Contact message persistence operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.contact.models import ContactMessage


async def create(db: AsyncSession, *, user_id: str | None, data: dict) -> ContactMessage:
    message = ContactMessage(user_id=user_id, **data)
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


async def find_all(db: AsyncSession) -> list[ContactMessage]:
    result = await db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc()))
    return list(result.scalars().all())
