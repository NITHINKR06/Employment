# Run `just` (no args) to list all recipes.
# Everything here is a thin wrapper around docker-compose — nothing here
# is required, it's just shorter/easier to remember.

default:
    @just --list

# Build images and start Postgres + backend + frontend, following logs.
up:
    docker compose up --build

# Same as `up` but detached (runs in the background).
up-d:
    docker compose up --build -d

# Stop and remove all containers (data volumes are kept).
down:
    docker compose down

# Stop containers AND wipe all data volumes (Postgres data, node_modules, venv).
nuke:
    docker compose down -v

# Tail logs for one service (or all, if none given): just logs backend
logs service="":
    docker compose logs -f {{service}}

# Show container status.
ps:
    docker compose ps

# Run the backend's pytest suite inside its running container.
test-backend:
    docker compose exec backend pytest -q

# Apply Alembic migrations manually (the backend container already does
# this on every start, but useful after adding a new migration file).
migrate:
    docker compose exec backend alembic upgrade head

# Open a shell inside a service container: just shell backend
shell service:
    docker compose exec {{service}} sh

# Restart a single service without rebuilding: just restart frontend
restart service:
    docker compose restart {{service}}
