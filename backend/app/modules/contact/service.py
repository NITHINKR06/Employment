"""Contact message business logic."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError
from app.modules.contact import repository
from app.modules.contact.models import ContactMessage
from app.modules.notifications import service as notifications_service
from app.modules.users import repository as users_repository
from app.modules.users.models import User


def _to_shape(message: ContactMessage) -> dict:
    return {
        "id": message.id,
        "userId": message.user_id,
        "name": message.name,
        "email": message.email,
        "subject": message.subject,
        "message": message.message,
        "createdAt": message.created_at.isoformat() if message.created_at else None,
    }


async def create_contact_message(db: AsyncSession, data: dict, user: User | None = None) -> dict:
    message = await repository.create(db, user_id=user.id if user else None, data=data)

    admin_ids = await users_repository.find_admin_ids(db)
    for admin_id in admin_ids:
        await notifications_service.notify_user(
            db,
            admin_id,
            title="New contact message",
            message=f"{message.name}: {message.message[:100]}",
        )

    return _to_shape(message)


async def list_contact_messages(db: AsyncSession, admin_user: User) -> list[dict]:
    """Admin-only. Meant to be delegated from the admin panel."""
    if admin_user.role.value != "ADMIN":
        raise ForbiddenError()
    messages = await repository.find_all(db)
    return [_to_shape(m) for m in messages]
