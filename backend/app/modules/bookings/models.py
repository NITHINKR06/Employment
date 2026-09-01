"""Booking ORM model — port of Prisma Booking."""

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


class BookingStatus(enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


def _generate_id() -> str:
    return str(ULID())


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    user_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    professional_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False
    )
    service_id: Mapped[str | None] = mapped_column(
        String(26), ForeignKey("services.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status_enum", create_constraint=True),
        default=BookingStatus.PENDING,
        nullable=False,
    )
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="bookings")  # noqa: F821
    professional: Mapped["Professional"] = relationship(back_populates="bookings")  # noqa: F821
    service: Mapped["Service | None"] = relationship(back_populates="bookings")  # noqa: F821
    payment: Mapped["Payment | None"] = relationship(  # noqa: F821
        back_populates="booking", uselist=False, cascade="all, delete-orphan"
    )
    review: Mapped["Review | None"] = relationship(  # noqa: F821
        back_populates="booking", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_bookings_user_id", "user_id"),
        Index("ix_bookings_professional_id", "professional_id"),
    )
