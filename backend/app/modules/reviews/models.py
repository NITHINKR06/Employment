"""Review ORM model — port of Prisma Review."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


def _generate_id() -> str:
    return str(ULID())


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    booking_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    booking: Mapped["Booking"] = relationship(back_populates="review")  # noqa: F821
