"""Dedupe time_slots and enforce uniqueness on (professional_id, starts_at).

`generate_slots` had no dedup check, so re-running it over an overlapping
date range silently created duplicate rows — one professional accumulated
thousands of slots for the same minute. This migration removes the
duplicates (keeping the booked row when one exists, else the earliest) and
adds a unique constraint so it can't happen again.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DELETE FROM time_slots
        WHERE id IN (
            SELECT id FROM (
                SELECT id,
                       row_number() OVER (
                           PARTITION BY professional_id, starts_at
                           ORDER BY is_booked DESC, created_at ASC
                       ) AS rn
                FROM time_slots
            ) ranked
            WHERE rn > 1
        )
        """
    )
    op.create_unique_constraint(
        "uq_time_slots_professional_starts_at",
        "time_slots",
        ["professional_id", "starts_at"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_time_slots_professional_starts_at", "time_slots", type_="unique")
