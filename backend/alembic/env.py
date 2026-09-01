"""Async-aware Alembic env for SQLAlchemy 2.0."""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings

# Import every module's models so Base.metadata knows about all tables.
from app.modules.users.models import *  # noqa: F401,F403
from app.modules.professionals.models import *  # noqa: F401,F403
from app.modules.bookings.models import *  # noqa: F401,F403
from app.modules.payments.models import *  # noqa: F401,F403
from app.modules.reviews.models import *  # noqa: F401,F403

from app.core.db import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in --sql mode (no live DB connection)."""
    url = settings.database_url_sync
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations against a live async DB."""
    connectable = create_async_engine(
        settings.database_url,  # needs the asyncpg-driver URL, not database_url_sync
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
