"""Users router — parse request → call service → return response."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.errors import UnauthorizedError
from app.core.security import get_current_user, verify_firebase_token
from app.modules.users import service
from app.modules.users.models import User
from app.modules.users.schemas import CreateSessionRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=dict)
async def get_me(user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return {
        "success": True,
        "data": {"user": UserResponse.model_validate(user).model_dump(by_alias=True)},
    }


@router.post("/session", response_model=dict)
async def create_session(
    request: Request,
    body: CreateSessionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Sign-up/sign-in: verify the token, upsert the user, optionally applying
    `role` — but only if this is that account's very first login ever."""
    claims = await verify_firebase_token(request)
    user = await service.get_or_create_user(
        db,
        firebase_uid=claims["firebase_uid"],
        email=claims["email"],
        name=claims["name"],
        role=body.role,
    )
    if not user.is_active:
        raise UnauthorizedError("This account has been suspended")

    return {
        "success": True,
        "data": {"user": UserResponse.model_validate(user).model_dump(by_alias=True)},
    }
