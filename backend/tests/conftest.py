"""Shared test fixtures for all unit tests.

Provides:
- In-memory SQLite async engine (no Postgres needed for unit tests)
- AsyncSession factory
- TestClient via httpx.AsyncClient
- Factory helpers for creating test entities
- Mock Firebase token verification
"""

import asyncio
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.db import Base, get_db
from app.modules.users.models import Role, User
from app.modules.professionals.models import Professional, Service, Skill, ProfessionalSkill
from app.modules.bookings.models import Booking, BookingStatus
from app.modules.payments.models import Payment, PaymentStatus
from app.modules.reviews.models import Review
from app.modules.notifications.models import Notification
from app.modules.contact.models import ContactMessage


# ── Engine & Session ──

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """Create all tables before each test, drop after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


# ── App & Client ──

@pytest_asyncio.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """httpx AsyncClient wired to the FastAPI app with DB override."""
    from app.main import app

    async def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# ── Factory helpers ──

_counter = 0


def _next_id() -> str:
    global _counter
    _counter += 1
    return f"test-id-{_counter:06d}"


@pytest_asyncio.fixture
async def make_user(db: AsyncSession):
    """Factory fixture: create a User."""
    async def _make(
        *,
        firebase_uid: str | None = None,
        email: str | None = None,
        name: str = "Test User",
        role: Role = Role.USER,
    ) -> User:
        uid = firebase_uid or f"fb-{_next_id()}"
        user = User(
            id=_next_id(),
            firebase_uid=uid,
            email=email or f"{uid}@test.com",
            name=name,
            role=role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    return _make


@pytest_asyncio.fixture
async def make_professional(db: AsyncSession, make_user):
    """Factory fixture: create a Professional with its User."""
    async def _make(
        *,
        user: User | None = None,
        title: str = "Test Pro",
        trade: str = "Plumbing",
        hourly_rate: float = 50.00,
        **kwargs,
    ) -> Professional:
        if user is None:
            user = await make_user(role=Role.EMPLOYEE)
        pro = Professional(
            id=_next_id(),
            user_id=user.id,
            title=title,
            trade=trade,
            hourly_rate=hourly_rate,
            **kwargs,
        )
        db.add(pro)
        await db.commit()
        await db.refresh(pro)
        return pro
    return _make


@pytest_asyncio.fixture
async def make_booking(db: AsyncSession, make_user, make_professional):
    """Factory fixture: create a Booking."""
    async def _make(
        *,
        user: User | None = None,
        professional: Professional | None = None,
        status: BookingStatus = BookingStatus.PENDING,
        address: str = "123 Test St",
        **kwargs,
    ) -> Booking:
        if user is None:
            user = await make_user()
        if professional is None:
            professional = await make_professional()
        booking = Booking(
            id=_next_id(),
            user_id=user.id,
            professional_id=professional.id,
            status=status,
            address=address,
            **kwargs,
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        return booking
    return _make


# ── Auth mock helpers ──

def auth_headers(user: User) -> dict:
    """Return Authorization headers for a user. Requires the firebase mock to be active."""
    return {"Authorization": f"Bearer mock-token-{user.firebase_uid}"}


@pytest_asyncio.fixture
async def mock_firebase():
    """Mock Firebase Admin SDK verification.

    Returns a callable that, given a User, patches verify_id_token to return
    that user's firebase_uid/email/name.
    """
    def _setup(user: User):
        mock_verify = MagicMock(return_value={
            "uid": user.firebase_uid,
            "email": user.email,
            "name": user.name,
        })
        # Patch both firebase init and verify
        patcher_app = patch("app.core.security._get_firebase_app", return_value=MagicMock())
        patcher_verify = patch("app.core.security.firebase_auth.verify_id_token", mock_verify)
        patcher_app.start()
        patcher_verify.start()
        return mock_verify

    yield _setup

    # Stop all patches
    patch.stopall()
