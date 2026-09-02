"""Compose and update current-user settings through domain services."""

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.core.errors import ValidationError
from app.modules.professionals import service as professionals_service
from app.modules.users import service as users_service
from app.modules.users.models import Role, User

_EMPLOYEE_FIELDS = {
    "title", "trade", "years_experience", "hourly_rate", "bio",
    "experience_summary", "location", "avatar", "availability",
}
_USER_FIELDS = {"name", "email", "phone"}


async def get_settings(db: AsyncSession, user: User) -> dict:
    data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role.value,
    }
    professional = await professionals_service.get_my_professional(db, user)
    if professional is not None:
        data["professional"] = professional
    return data


async def update_settings(db: AsyncSession, user: User, data: dict) -> dict:
    supplied = {key: value for key, value in data.items() if value is not None}
    employee_fields = _EMPLOYEE_FIELDS & supplied.keys()
    if employee_fields and user.role != Role.EMPLOYEE:
        raise HTTPException(
            status_code=422,
            detail="Professional settings are only available to EMPLOYEE users",
        )

    user_data = {key: value for key, value in supplied.items() if key in _USER_FIELDS}
    if user_data:
        user = await users_service.update_user(db, user, user_data)

    professional_data = {key: value for key, value in supplied.items() if key in _EMPLOYEE_FIELDS}
    if professional_data:
        professional = await professionals_service.get_my_professional(db, user)
        if professional is None:
            raise ValidationError("An EMPLOYEE profile is required before updating professional settings")
        await professionals_service.update_professional(db, user, professional["id"], professional_data)

    return await get_settings(db, user)
