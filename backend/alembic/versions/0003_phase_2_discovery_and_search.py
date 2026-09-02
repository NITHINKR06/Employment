"""Phase 2 — discovery & search: categories (+ backfill), favorites,
location columns already exist on professionals (bounding-box search reuses them).
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from ulid import ULID


revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("name", sa.String(), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.add_column(
        "professionals",
        sa.Column("category_id", sa.String(26), sa.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True),
    )

    op.create_table(
        "favorites",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("user_id", sa.String(26), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("professional_id", sa.String(26), sa.ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "professional_id", name="uq_favorites_user_professional"),
    )

    # Backfill: one Category per distinct existing `trade` string, then point
    # each professional's new category_id at the category matching its trade.
    connection = op.get_bind()
    categories_table = sa.table("categories", sa.column("id", sa.String), sa.column("name", sa.String))
    professionals_table = sa.table(
        "professionals", sa.column("id", sa.String), sa.column("trade", sa.String), sa.column("category_id", sa.String)
    )

    distinct_trades = connection.execute(
        sa.select(professionals_table.c.trade).distinct()
    ).scalars().all()

    for trade in distinct_trades:
        if not trade:
            continue
        category_id = str(ULID())
        connection.execute(categories_table.insert().values(id=category_id, name=trade))
        connection.execute(
            professionals_table.update()
            .where(professionals_table.c.trade == trade)
            .values(category_id=category_id)
        )


def downgrade() -> None:
    op.drop_table("favorites")
    op.drop_column("professionals", "category_id")
    op.drop_table("categories")
