"""Initial schema — all Phase 0 tables.

Revision ID: 0001
Revises: None
Create Date: 2026-09-01

Port of prisma/schema.prisma → SQLAlchemy tables:
  users, professionals, skills, professional_skills, trust_badges,
  portfolio_images, services, bookings, payments, reviews.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Enum names
ROLE_ENUM = "role_enum"
BOOKING_STATUS_ENUM = "booking_status_enum"
PAYMENT_STATUS_ENUM = "payment_status_enum"


def upgrade() -> None:
    # ── Enums ──
    role_enum = sa.Enum("USER", "EMPLOYEE", "ADMIN", name=ROLE_ENUM)
    role_enum.create(op.get_bind(), checkfirst=True)

    booking_status_enum = sa.Enum(
        "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED",
        name=BOOKING_STATUS_ENUM,
    )
    booking_status_enum.create(op.get_bind(), checkfirst=True)

    payment_status_enum = sa.Enum(
        "PENDING", "PAID", "FAILED", "REFUNDED",
        name=PAYMENT_STATUS_ENUM,
    )
    payment_status_enum.create(op.get_bind(), checkfirst=True)

    # ── users ──
    op.create_table(
        "users",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("firebase_uid", sa.String(), nullable=False, unique=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("role", postgresql.ENUM("USER", "EMPLOYEE", "ADMIN", name=ROLE_ENUM, create_type=False), nullable=False, server_default="USER"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── professionals ──
    op.create_table(
        "professionals",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("user_id", sa.String(26), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("trade", sa.String(), nullable=False),
        sa.Column("years_experience", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("hourly_rate", sa.Numeric(10, 2), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("experience_summary", sa.Text(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("avatar", sa.String(), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("availability", sa.String(), nullable=True),
        sa.Column("rating_avg", sa.Numeric(3, 2), nullable=False, server_default="0"),
        sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_professionals_trade", "professionals", ["trade"])

    # ── skills ──
    op.create_table(
        "skills",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("name", sa.String(), nullable=False, unique=True),
    )

    # ── professional_skills (join table) ──
    op.create_table(
        "professional_skills",
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("skill_id", sa.String(26), sa.ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
    )

    # ── trust_badges ──
    op.create_table(
        "trust_badges",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
    )

    # ── portfolio_images ──
    op.create_table(
        "portfolio_images",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
    )

    # ── services ──
    op.create_table(
        "services",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("subtext", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(10, 2), nullable=True),
    )

    # ── bookings ──
    op.create_table(
        "bookings",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("user_id", sa.String(26), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("service_id", sa.String(26), sa.ForeignKey("services.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", postgresql.ENUM("PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", name=BOOKING_STATUS_ENUM, create_type=False), nullable=False, server_default="PENDING"),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_bookings_user_id", "bookings", ["user_id"])
    op.create_index("ix_bookings_professional_id", "bookings", ["professional_id"])

    # ── payments ──
    op.create_table(
        "payments",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("booking_id", sa.String(26), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", postgresql.ENUM("PENDING", "PAID", "FAILED", "REFUNDED", name=PAYMENT_STATUS_ENUM, create_type=False), nullable=False, server_default="PENDING"),
        sa.Column("provider", sa.String(), nullable=True),
        sa.Column("provider_ref", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── reviews ──
    op.create_table(
        "reviews",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("booking_id", sa.String(26), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("reviews")
    op.drop_table("payments")
    op.drop_index("ix_bookings_professional_id", table_name="bookings")
    op.drop_index("ix_bookings_user_id", table_name="bookings")
    op.drop_table("bookings")
    op.drop_table("services")
    op.drop_table("portfolio_images")
    op.drop_table("trust_badges")
    op.drop_table("professional_skills")
    op.drop_table("skills")
    op.drop_index("ix_professionals_trade", table_name="professionals")
    op.drop_table("professionals")
    op.drop_table("users")

    sa.Enum(name=PAYMENT_STATUS_ENUM).drop(op.get_bind(), checkfirst=True)
    sa.Enum(name=BOOKING_STATUS_ENUM).drop(op.get_bind(), checkfirst=True)
    sa.Enum(name=ROLE_ENUM).drop(op.get_bind(), checkfirst=True)
