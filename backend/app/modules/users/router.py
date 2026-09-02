"""Users router — parse request → call service → return response."""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.modules.users.models import User
from app.modules.users.schemas import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=dict)
async def get_me(user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return {
        "success": True,
        "data": {"user": UserResponse.model_validate(user).model_dump(by_alias=True)},
    }
