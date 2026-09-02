"""User ORM model — port of Prisma User model."""

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


class Role(enum.Enum):
    USER = "USER"
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"


def _generate_id() -> str:
    return str(ULID())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    firebase_uid: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role, name="role_enum", create_constraint=True), default=Role.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    professional: Mapped["Professional | None"] = relationship(  # noqa: F821
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    bookings: Mapped[list["Booking"]] = relationship(  # noqa: F821
        back_populates="user",
        cascade="all, delete-orphan",
    )
