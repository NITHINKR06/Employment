"""Phase 5 — trust & reviews: review responses, disputes, verification requests."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("reviews", sa.Column("professional_response", sa.Text(), nullable=True))
    op.add_column("reviews", sa.Column("responded_at", sa.DateTime(timezone=True), nullable=True))

    op.create_table(
        "disputes",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("user_id", sa.String(26), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("booking_id", sa.String(26), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("subject", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("OPEN", "RESOLVED", name="dispute_status_enum"), nullable=False, server_default="OPEN"),
        sa.Column("resolution", sa.Text(), nullable=True),
        sa.Column("resolved_by", sa.String(26), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "verification_requests",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.Enum("PENDING", "APPROVED", "REJECTED", name="verification_status_enum"), nullable=False, server_default="PENDING"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("reviewed_by", sa.String(26), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("verification_requests")
    op.execute("DROP TYPE IF EXISTS verification_status_enum")
    op.drop_table("disputes")
    op.execute("DROP TYPE IF EXISTS dispute_status_enum")
    op.drop_column("reviews", "responded_at")
    op.drop_column("reviews", "professional_response")
