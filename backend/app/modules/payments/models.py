"""Payment ORM model — port of Prisma Payment."""

import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


class PaymentStatus(enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


def _generate_id() -> str:
    return str(ULID())


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    booking_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status_enum", create_constraint=True),
        default=PaymentStatus.PENDING,
        nullable=False,
    )
    provider: Mapped[str | None] = mapped_column(String, nullable=True)
    provider_ref: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    booking: Mapped["Booking"] = relationship(back_populates="payment")  # noqa: F821
