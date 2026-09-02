"""Public contact endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_optional_user
from app.modules.contact import service
from app.modules.contact.schemas import CreateContactMessageRequest
from app.modules.users.models import User

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=201)
async def create_contact_message(
    body: CreateContactMessageRequest,
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "data": await service.create_contact_message(db, body.model_dump(), user)}
