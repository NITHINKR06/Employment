# ProMarket

A full-stack local services marketplace — connect with trusted professionals (plumbers, electricians, painters, etc.) near you, book them instantly, pay, and leave reviews. Think **Urban Company / TaskRabbit**, built from scratch.

## What It Does

ProMarket bridges the gap between **customers** who need home/local services and **professionals** who offer them. Customers can search by trade, location, and availability, view portfolios and reviews, book a time slot, pay (UPI QR), and rate the work afterward. Professionals get a dashboard to manage their profile, services, bookings, and earnings.

## How It Works

```
Customer signs up (Firebase Auth)
  → Searches for a professional (by trade, location, rating)
  → Views their profile (bio, skills, portfolio, reviews, trust badges)
  → Books a service (picks a date/time, adds address & notes)
  → Pays via UPI QR code
  → After the job, leaves a rating & review

Professional signs up
  → Creates a profile (trade, hourly rate, skills, portfolio images)
  → Receives & manages bookings (accept / complete / cancel)
  → Tracks payments & reviews on their dashboard
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 16 (Prisma ORM for frontend, SQLAlchemy for backend) |
| Auth | Firebase Authentication |
| Infra | Docker Compose, pnpm workspaces |

## Quick Start

### With Docker (recommended)

```bash
# Copy env files and fill in your values
cp .env.example .env
cp backend/.env.example backend/.env

# Start everything (Postgres + backend + frontend)
just up
```

Open [http://localhost:3000](http://localhost:3000) for the frontend and [http://localhost:8000/docs](http://localhost:8000/docs) for the API docs.

### Without Docker

```bash
# Frontend
pnpm install
pnpm dev

# Backend (in a separate terminal)
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

## Project Structure

```
├── src/              # Next.js frontend (app router, components, lib)
├── backend/          # FastAPI backend (app/, alembic/, tests/)
├── prisma/           # Prisma schema & migrations (frontend DB layer)
├── docker/           # Docker init scripts (init-db.sql)
├── public/           # Static assets
├── docs/             # Planning & architecture docs
├── Dockerfile        # Frontend dev image
├── docker-compose.yml
└── justfile          # Task runner shortcuts (just up, just down, etc.)
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `just up` | Build & start all services |
| `just down` | Stop all containers |
| `just nuke` | Stop & wipe all data volumes |
| `just logs backend` | Tail logs for a service |
| `just test-backend` | Run backend pytest suite |
| `just migrate` | Apply Alembic migrations |
| `just shell backend` | Shell into a container |

## Documentation

See the [`docs/`](docs/) directory for detailed planning and architecture docs:

- [Backend Plan (FastAPI)](docs/BACKEND_PLAN.md)
- [Backend Plan (JS Legacy)](docs/BACKEND_PLAN_JS_LEGACY.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Roadmap](docs/ROADMAP.md)
- [Site Essentials](docs/SITE-ESSENTIALS.md)
