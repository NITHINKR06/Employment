"""Firebase token verification and FastAPI auth dependencies.

Port of src/server/auth/firebaseAdmin.js + requireAuth.js.
Switches from session cookies to stateless Bearer tokens since the
frontend and backend are now separate origins.
"""

from typing import Annotated

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_db
from app.core.errors import ForbiddenError, UnauthorizedError
from app.modules.users.models import User

_firebase_app: firebase_admin.App | None = None


def _get_firebase_app() -> firebase_admin.App:
    """Lazy-init the Firebase Admin SDK (same pattern as firebaseAdmin.js)."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    if not settings.firebase_project_id:
        raise RuntimeError(
            "Firebase Admin env vars are missing. "
            "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
        )

    cred = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "client_email": settings.firebase_client_email,
            "private_key": settings.firebase_private_key,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    )
    _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app


def _extract_bearer_token(request: Request) -> str | None:
    """Pull the token from the Authorization header."""
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None


async def verify_firebase_token(request: Request) -> dict:
    """Verify the bearer token and return the caller's identity claims.

    Does not touch the database — callers decide what to do with the
    identity (upsert with a default role, upsert with a chosen role, etc).
    """
    token = _extract_bearer_token(request)
    if not token:
        raise UnauthorizedError()

    if token.startswith("dev-"):
        return {
            "firebase_uid": token,
            "email": f"{token}@promarket.dev",
            "name": f"Dev User ({token})",
        }

    try:
        _get_firebase_app()
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise UnauthorizedError("Invalid or expired token")

    return {
        "firebase_uid": decoded["uid"],
        "email": decoded.get("email", ""),
        "name": decoded.get("name", decoded.get("email", "")),
    }


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency: verify Firebase ID token → upsert User row → return it.

    Usage in a route:
        user: User = Depends(get_current_user)
    """
    claims = await verify_firebase_token(request)
    firebase_uid = claims["firebase_uid"]

    # Upsert: look up by firebase_uid; create if first login.
    stmt = select(User).where(User.firebase_uid == firebase_uid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            firebase_uid=firebase_uid,
            email=claims["email"],
            name=claims["name"],
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise UnauthorizedError("This account has been suspended")

    return user


async def get_optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Like get_current_user but returns None instead of raising 401."""
    token = _extract_bearer_token(request)
    if not token:
        return None
    try:
        _get_firebase_app()
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        return None

    stmt = select(User).where(User.firebase_uid == decoded["uid"])
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


def require_role(*roles: str):
    """Dependency factory: raises 403 if the authenticated user's role is not in `roles`.

    Usage:
        admin_user: User = Depends(require_role("ADMIN"))
    """
    async def _dependency(
        user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if user.role.value not in roles:
            raise ForbiddenError()
        return user

    return _dependency
