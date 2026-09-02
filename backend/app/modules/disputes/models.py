"""Dispute ORM model — a user's complaint against a booking, resolved by an admin."""

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


class DisputeStatus(enum.Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"


def _generate_id() -> str:
    return str(ULID())


class Dispute(Base):
    __tablename__ = "disputes"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    user_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    booking_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False
    )
    subject: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[DisputeStatus] = mapped_column(
        Enum(DisputeStatus, name="dispute_status_enum", create_constraint=True),
        default=DisputeStatus.OPEN,
        nullable=False,
    )
    resolution: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(
        String(26), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(foreign_keys=[user_id])  # noqa: F821
    booking: Mapped["Booking"] = relationship()  # noqa: F821


# Deferred import resolution — resolved at mapper config time.
from app.modules.bookings.models import Booking  # noqa: E402,F811
from app.modules.users.models import User  # noqa: E402,F811
