-- Runs once, only when the Postgres data volume is freshly created.
-- The JS/Prisma backend uses the default POSTGRES_DB ("promarket");
-- the Python/FastAPI backend gets its own database to avoid schema
-- collisions between Prisma and SQLAlchemy/Alembic on the same DB.
CREATE DATABASE promarket_py;
