"""TimeSlot ORM model — a professional's bookable windows."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


def _generate_id() -> str:
    return str(ULID())


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    professional_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False
    )
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    booking_id: Mapped[str | None] = mapped_column(
        String(26), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    professional: Mapped["Professional"] = relationship()  # noqa: F821

    __table_args__ = (
        Index("ix_time_slots_professional_id", "professional_id"),
        Index("ix_time_slots_booking_id", "booking_id"),
        UniqueConstraint(
            "professional_id", "starts_at", name="uq_time_slots_professional_starts_at"
        ),
    )


# Deferred import resolution — resolved at mapper config time.
from app.modules.professionals.models import Professional  # noqa: E402,F811
