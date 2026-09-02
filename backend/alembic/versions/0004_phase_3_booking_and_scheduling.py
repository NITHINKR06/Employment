"""Phase 3 — booking & scheduling: time_slots, recurring_bookings."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "time_slots",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_booked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("booking_id", sa.String(26), sa.ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_time_slots_professional_id", "time_slots", ["professional_id"])
    op.create_index("ix_time_slots_booking_id", "time_slots", ["booking_id"])

    recurring_frequency_enum = postgresql.ENUM(
        "WEEKLY", "BIWEEKLY", "MONTHLY", name="recurring_frequency_enum", create_type=True
    )
    recurring_frequency_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "recurring_bookings",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("user_id", sa.String(26), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("service_id", sa.String(26), sa.ForeignKey("services.id", ondelete="SET NULL"), nullable=True),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("frequency", postgresql.ENUM("WEEKLY", "BIWEEKLY", "MONTHLY", name="recurring_frequency_enum", create_type=False), nullable=False),
        sa.Column("next_run_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("recurring_bookings")
    op.execute("DROP TYPE IF EXISTS recurring_frequency_enum")
    op.drop_index("ix_time_slots_booking_id", table_name="time_slots")
    op.drop_index("ix_time_slots_professional_id", table_name="time_slots")
    op.drop_table("time_slots")
