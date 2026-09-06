"""Admin contact-message viewing — thin delegation to `contact`, never touches its repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.contact import service as contact_service
from app.modules.users.models import User


async def list_all_messages(db: AsyncSession, admin_user: User) -> list[dict]:
    return await contact_service.list_contact_messages(db, admin_user)
