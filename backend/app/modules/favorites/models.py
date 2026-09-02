"""Favorite ORM model — a user's saved professionals."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


def _generate_id() -> str:
    return str(ULID())


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    user_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    professional_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    professional: Mapped["Professional"] = relationship()  # noqa: F821

    __table_args__ = (
        UniqueConstraint("user_id", "professional_id", name="uq_favorites_user_professional"),
    )


# Deferred import resolution — resolved at mapper config time.
from app.modules.professionals.models import Professional  # noqa: E402,F811
