"""Contact message persistence operations."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.contact.models import ContactMessage


async def create(db: AsyncSession, *, user_id: str | None, data: dict) -> ContactMessage:
    message = ContactMessage(user_id=user_id, **data)
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
