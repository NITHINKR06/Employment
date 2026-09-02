"""Phase 6 — professional-side tools: service_radius_km, portfolio_images.position.

`earnings` composes existing bookings+payments tables — no migration needed.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "professionals",
        sa.Column("service_radius_km", sa.Integer(), nullable=False, server_default="25"),
    )
    op.add_column(
        "portfolio_images",
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("portfolio_images", "position")
    op.drop_column("professionals", "service_radius_km")
