"""Contact message business logic."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.contact import repository
from app.modules.sms import service as sms_service
from app.modules.users.models import User


async def create_contact_message(db: AsyncSession, data: dict, user: User | None = None) -> dict:
    message = await repository.create(db, user_id=user.id if user else None, data=data)
    await sms_service.notify_admin_of_contact_message(name=message.name, message=message.message)
    return {
        "id": message.id,
        "userId": message.user_id,
        "name": message.name,
        "email": message.email,
        "subject": message.subject,
        "message": message.message,
        "createdAt": message.created_at.isoformat() if message.created_at else None,
    }
