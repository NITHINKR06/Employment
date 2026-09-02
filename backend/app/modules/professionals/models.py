"""Professional and related ORM models — port of Prisma Professional, Skill,
ProfessionalSkill, TrustBadge, PortfolioImage, Service."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Boolean,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ulid import ULID

from app.core.db import Base


def _generate_id() -> str:
    return str(ULID())


# ── Skill ──

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    professionals: Mapped[list["ProfessionalSkill"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
    )


# ── ProfessionalSkill (join table) ──

class ProfessionalSkill(Base):
    __tablename__ = "professional_skills"

    professional_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("professionals.id", ondelete="CASCADE"), primary_key=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    )

    professional: Mapped["Professional"] = relationship(back_populates="skills")
    skill: Mapped["Skill"] = relationship(back_populates="professionals")


# ── TrustBadge ──

class TrustBadge(Base):
    __tablename__ = "trust_badges"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    professional_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String, nullable=False)

    professional: Mapped["Professional"] = relationship(back_populates="trust_badges")


# ── PortfolioImage ──

class PortfolioImage(Base):
    __tablename__ = "portfolio_images"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    professional_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    professional: Mapped["Professional"] = relationship(back_populates="portfolio_images")


# ── Service ──

class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    professional_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    subtext: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    professional: Mapped["Professional"] = relationship(back_populates="services")
    bookings: Mapped[list["Booking"]] = relationship(  # noqa: F821
        back_populates="service",
    )


# ── Professional ──

class Professional(Base):
    __tablename__ = "professionals"

    id: Mapped[str] = mapped_column(String(26), primary_key=True, default=_generate_id)
    user_id: Mapped[str] = mapped_column(
        String(26), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    category_id: Mapped[str | None] = mapped_column(
        String(26), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    trade: Mapped[str] = mapped_column(String, nullable=False)
    years_experience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hourly_rate: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    availability: Mapped[str | None] = mapped_column(String, nullable=True)
    service_radius_km: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    rating_avg: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0.00"), nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="professional")  # noqa: F821
    skills: Mapped[list[ProfessionalSkill]] = relationship(
        back_populates="professional", cascade="all, delete-orphan"
    )
    trust_badges: Mapped[list[TrustBadge]] = relationship(
        back_populates="professional", cascade="all, delete-orphan"
    )
    portfolio_images: Mapped[list[PortfolioImage]] = relationship(
        back_populates="professional", cascade="all, delete-orphan"
    )
    services: Mapped[list[Service]] = relationship(
        back_populates="professional", cascade="all, delete-orphan"
    )
    bookings: Mapped[list["Booking"]] = relationship(  # noqa: F821
        back_populates="professional", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_professionals_trade", "trade"),
    )


# Deferred import resolution — these strings are resolved at mapper config time.
from app.modules.users.models import User  # noqa: E402,F811
