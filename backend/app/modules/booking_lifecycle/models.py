"""RecurringBooking ORM model — a template that spins up concrete Bookings on a cadence."""

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


class RecurringFrequency(enum.Enum):
    WEEKLY = "WEEKLY"
    BIWEEKLY = "BIWEEKLY"
    MONTHLY = "MONTHLY"


def _generate_id() -> str:
    return str(ULID())


class RecurringBooking(Base):
    __tablename__ = "recurring_bookings"

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
    address: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    frequency: Mapped[RecurringFrequency] = mapped_column(
        Enum(RecurringFrequency, name="recurring_frequency_enum", create_constraint=True),
        nullable=False,
    )
    next_run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship()  # noqa: F821
    professional: Mapped["Professional"] = relationship()  # noqa: F821


# Deferred import resolution — resolved at mapper config time.
from app.modules.professionals.models import Professional  # noqa: E402,F811
from app.modules.users.models import User  # noqa: E402,F811
