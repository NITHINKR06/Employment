# Backend Plan — Python (FastAPI)

Supersedes `BACKEND_PLAN_JS_LEGACY.md` (kept in the repo as a record of the JS/Next.js-route-handler approach that was scoped and partly built first — phases 0–7 there are real, working history, not a draft). The backend is now built in Python going forward. The Next.js app (`src/app`, `src/components`, etc.) stays exactly as-is as the **frontend only** — it stops having any `app/api/*` route handlers and instead calls this new service over HTTP.

**Why this split, given the goals (job-hunting portfolio + possible startup pitch):** a real Next.js frontend + a real FastAPI backend, talking over a versioned REST API, is a stronger portfolio story ("I built and integrated two services") than one Next.js app doing both, and it's the shape a startup would actually scale into (frontend and backend teams, independent deploys, independent scaling).

---

## Stack

- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0 (async) + Alembic for migrations — the industry-standard combo (interview-recognizable), as opposed to SQLModel which is lighter but less commonly asked about
- **Validation:** Pydantic v2 (FastAPI's native schema layer — same role zod played in the JS plan)
- **Auth:** Firebase Authentication stays (client-side signup/login/Google sign-in unchanged) — the Python backend verifies the Firebase ID token per-request via the official `firebase-admin` Python SDK, using a stateless Bearer token instead of the old httpOnly session cookie (cookies don't cross the frontend/backend origin split cleanly; a Bearer token in `Authorization` header is the standard pattern for a separate API)
- **DB:** same Postgres instance/schema conceptually, recreated as SQLAlchemy models + Alembic migrations (not reusing `prisma/schema.prisma` — Prisma is JS-only)
- **Package/env management:** `uv` (fast, modern) or `poetry` — pick `uv`
- **Server:** Uvicorn (dev) / Gunicorn+Uvicorn workers (prod)

---

## Hard rules for every module (same discipline as the JS plan, just Python-shaped)

1. `router.py` = parse request (Pydantic model from the body) → call service → return response model. No business logic, no SQLAlchemy queries here.
2. `service.py` = business logic + authorization checks only. No raw SQLAlchemy session queries here.
3. `repository.py` = the only place that touches the SQLAlchemy session/queries for that domain.
4. `schemas.py` = Pydantic request/response models for that domain only.
5. `models.py` = SQLAlchemy ORM models for that domain only (one domain's tables, not a shared dumping file).
6. A module never imports another module's `repository.py`. Cross-domain reads go through the other module's `service.py`.
7. One Alembic migration per feature, never bundled with an unrelated domain's schema change.

---

## Folder structure

```
backend/
  pyproject.toml
  alembic.ini
  alembic/
    versions/
  app/
    main.py                      # FastAPI app, router registration, CORS, startup
    core/
      config.py                  # env/settings (pydantic-settings)
      db.py                       # async SQLAlchemy engine/session factory
      security.py                 # Firebase Admin init + verify_id_token + get_current_user dependency
      errors.py                   # typed AppError classes + global exception handler
      response.py                  # consistent response envelope helper

    modules/
      users/
        models.py    service.py    repository.py    schemas.py    router.py
      professionals/
        models.py    service.py    repository.py    schemas.py    router.py
      bookings/
        models.py    service.py    repository.py    schemas.py    router.py
      payments/                      # mock provider only — explicitly excluded from real integration
        models.py    service.py    repository.py    schemas.py    router.py
      reviews/
        models.py    service.py    repository.py    schemas.py    router.py

      notifications/
        models.py    service.py    repository.py    schemas.py    router.py
      contact/
        models.py    service.py    repository.py    schemas.py    router.py
      settings/
        service.py    schemas.py    router.py          # no own table — composes users/professionals repos
      categories/
        models.py    service.py    repository.py    schemas.py    router.py
      favorites/
        models.py    service.py    repository.py    schemas.py    router.py
      geocoding/
        client.py     service.py    router.py           # Nominatim HTTP client, no DB
      availability/
        models.py    service.py    repository.py    schemas.py    router.py
      booking_lifecycle/
        reschedule_service.py   recurring_models.py   recurring_repository.py
        recurring_service.py    cancellation_service.py   schemas.py    router.py
      sms/
        client.py     service.py                          # open-source/self-hosted gateway wrapper, no router (internal only)
      push/
        models.py    service.py    repository.py    schemas.py    router.py
      review_response/
        service.py    schemas.py    router.py            # extends reviews.models, no own table
      disputes/
        models.py    service.py    repository.py    schemas.py    router.py
      verification/
        models.py    service.py    repository.py    schemas.py    router.py
      earnings/
        service.py    schemas.py    router.py            # read-only aggregation, no own table
      service_area/
        service.py    schemas.py    router.py            # extends professionals.models
      portfolio/
        models.py    service.py    repository.py    schemas.py    router.py
      admin/
        user_service.py   analytics_service.py   dispute_service.py
        schemas.py    router.py
      uploads/
        client.py     service.py    schemas.py    router.py

  tests/
    unit/                          # pytest, one test module per domain module
    e2e/
```

Route registration in `main.py` mounts each module's `router.py` under a versioned prefix (`/api/v1/...`) — same endpoint shapes as the original JS plan, just served from this app instead of Next.js.

---

## Auth flow (adjusted for the split)

- Client (Next.js, unchanged): Firebase JS SDK handles signup/login/Google sign-in, gets an ID token.
- Client sends the ID token as `Authorization: Bearer <token>` on every request to the FastAPI backend — no session-cookie exchange step needed anymore (that pattern existed to bridge Firebase → Next.js server components in the same origin; not needed when the frontend just calls a separate API like any other client).
- `core/security.py` — `get_current_user` FastAPI dependency: verifies the ID token via `firebase_admin.auth.verify_id_token`, looks up/upserts the `User` row by `firebase_uid`, returns it. Any route needing auth just declares `user: User = Depends(get_current_user)`.
- Role checks: a `require_role("ADMIN")` dependency factory, same idea as the old `requireRole`.
- CORS: FastAPI `CORSMiddleware` allowing the Next.js frontend origin, credentials not needed since it's Bearer-token based (no cookies to allow cross-origin).

---

## How each module is tracked

Every module below has two checklists: **Build** (migration/repository/service/schema/router) and **Tests** (`tests/unit/test_<module>.py`, pytest). A module isn't done until both are checked — same bar as the JS plan's "verified via smoke test," just formalized as real test files instead of one-off manual checks. Tests use `pytest-asyncio` + a test-only Postgres schema (or SQLite for pure-logic service tests where no Postgres-specific SQL is used) and mock cross-module service calls (e.g. `bookings` tests mock `notifications.service.notify_user`, not the real thing).

---

## Phase 0 — Port existing JS backend to Python

*(This already exists and works in JS per `BACKEND_PLAN_JS_LEGACY.md` phases 0–7 — it needs porting, not designing from scratch.)*

**Status (2026-09-01): built and verified.** All 5 modules + core exist, `alembic upgrade head` runs clean against a fresh DB, all 27 planned unit tests pass, and the app boots under Uvicorn serving every `/api/v1/*` route (verified via `/openapi.json`). Three real bugs were found and fixed while verifying:
1. `app/core/config.py` — `.env`'s `DATABASE_URL` (shared with the old Prisma setup) had no driver spec, so the async engine fell back to `psycopg2` (not a dependency). Added a validator forcing the `asyncpg` driver and stripping Prisma's `?schema=` param, which `asyncpg` doesn't accept as a keyword arg.
2. `alembic/env.py:50` — online migrations passed the *sync* URL into `create_async_engine` (backwards); fixed to use the async URL.
3. `alembic/versions/0001_initial_schema.py` — the `role`/`status` enum columns used generic `sa.Enum(..., create_type=False)`, which Postgres doesn't reliably honor; `op.create_table` re-issued `CREATE TYPE` and collided with the type created two lines earlier. Fixed by using `sqlalchemy.dialects.postgresql.ENUM(..., create_type=False)` instead, the standard reliable pattern.

Also: the local Postgres container already held the old Prisma-created schema in the `promarket` database. Created a separate `promarket_py` database in the same container for the Python backend (`backend/.env` updated; root `.env`, used by the JS side, untouched) rather than risk the existing seed data.

Remaining before Phase 0 is fully closed: the Cutover items below (frontend not yet pointed at this backend).

### `core` (db, config, security)
- Build
  - [x] `core/db.py`, `core/config.py`, `alembic` init — recreate the schema from `prisma/schema.prisma` as SQLAlchemy models (User, Professional, Skill, ProfessionalSkill, TrustBadge, PortfolioImage, Service, Booking, Payment, Review)
  - [x] `core/security.py` — Firebase Admin Python SDK setup, `get_current_user`/`require_role`
  - [x] `core/errors.py`, `core/response.py` — typed exceptions + global handler + response envelope
- Tests (`tests/unit/test_security.py`)
  - [x] `get_current_user` raises 401 on missing/invalid/expired token
  - [x] `get_current_user` upserts a new `User` row on first-ever verified token for a `firebase_uid`
  - [x] `get_current_user` returns the existing `User` row on a repeat call (no duplicate insert)
  - [x] `require_role("ADMIN")` raises 403 for a non-admin user, passes for an admin

### `modules/users`
- Build
  - [x] `models.py`, `repository.py`, `service.py` — upsert-on-login logic (ported from old `/api/auth/session` route)
- Tests (`tests/unit/test_users.py`)
  - [x] creates a user on first login with correct default `role=USER`
  - [x] does not overwrite `role` on a subsequent login for an existing user
  - [x] `get_user_by_id` raises `NotFoundError` for an unknown id

### `modules/professionals`
- Build
  - [x] port `professional.service.js`/`professional.repository.js` logic 1:1 (list/search/filter, detail, create, update, delete)
- Tests (`tests/unit/test_professionals.py`)
  - [x] list endpoint applies trade/rate/rating filters correctly (each filter tested independently)
  - [x] search returns the flat UI shape (skills as `list[str]`, portfolio as `list[str]`, etc.)
  - [x] update/delete raises 403 when the caller doesn't own the professional profile
  - [x] detail raises `NotFoundError` for an unknown id

### `modules/bookings`
- Build
  - [x] port booking status-transition table + ownership rules
- Tests (`tests/unit/test_bookings.py`)
  - [x] every allowed transition in the table succeeds (`PENDING→CONFIRMED→IN_PROGRESS→COMPLETED`, either side `→CANCELLED` from a non-terminal state)
  - [x] every disallowed transition raises a validation error (e.g. `COMPLETED→CONFIRMED`)
  - [x] a user who isn't the booking's customer or professional gets 403 on any mutation
  - [x] list-mine returns the counterpart shape correctly for both customer and professional viewpoints

### `modules/payments` (mock provider only — real gateway explicitly excluded)
- Build
  - [x] port mock payment provider (`pay_for_booking` marks `PAID` immediately, `provider="mock-<method>"`)
- Tests (`tests/unit/test_payments.py`)
  - [x] paying a `PENDING` booking marks it `CONFIRMED` in the same transaction
  - [x] a second payment attempt on an already-paid booking is rejected
  - [x] a user who doesn't own the booking cannot pay or read its payment record

### `modules/reviews`
- Build
  - [x] port review creation (booking-completed + one-per-booking + rating recompute)
- Tests (`tests/unit/test_reviews.py`)
  - [x] review creation rejected if the booking isn't `COMPLETED`
  - [x] review creation rejected on a second attempt for the same booking
  - [x] `Professional.rating_avg`/`review_count` recompute correctly after each new review (test with 1, then 2, then 3 reviews)
  - [x] `list_professional_reviews` is callable without auth (public)

### Cutover
- [x] Point the Next.js frontend's `fetch('/api/...')` calls at the new FastAPI base URL instead of its own route handlers; remove `src/app/api/*` once parity is verified
- [x] Data migration: export existing Postgres data (if any real users exist beyond seed data) or just re-run an equivalent seed script in Python (`backend/app/seed.py`)
- [x] Verify: FastAPI's auto-generated OpenAPI docs (`/docs`) match the old endpoint shapes; full `pytest` suite green before removing the JS routes

---

## Phase 1 — Stubbed features

### `modules/notifications`
- Build
  - [x] `Notification` model + migration, list/mark-read/clear endpoints, `notify_user()` used by other modules
- Tests (`tests/unit/test_notifications.py`)
  - [x] `notify_user` creates a row with `read_at=None`
  - [x] mark-read sets `read_at`, is a no-op (not an error) if called twice
  - [x] clear-all only deletes the calling user's notifications, not others'
  - [x] list only returns the calling user's notifications, newest first

### `modules/settings`
- Build
  - [x] get/update settings composing `users`+`professionals` repos (no own table)
- Tests (`tests/unit/test_settings.py`)
  - [x] GET returns the current user's data pre-filled (not empty defaults)
  - [x] PATCH persists and a subsequent GET reflects the change
  - [x] EMPLOYEE-only fields rejected (422) when sent by a USER role

### `modules/contact`
- Build
  - [x] `ContactMessage` model + migration, create endpoint (alerts admin via `sms` module once Phase 4 lands — stubbed no-op until then)
- Tests (`tests/unit/test_contact.py`)
  - [x] anonymous (unauthenticated) submission succeeds and is stored
  - [x] authenticated submission stores the `user_id`
  - [x] invalid email format rejected by schema validation

---

## Phase 2 — Discovery & search

**Status (2026-09-02): built and verified.** All 5 sub-areas landed, full `pytest` suite green.

### `modules/categories`
- Build
  - [x] `Category` model + migration, backfill `Professional.category_id` from existing `trade` strings, list-with-counts endpoint
- Tests (`tests/unit/test_categories.py`)
  - [x] list returns accurate per-category professional counts
  - [x] a category with zero professionals still appears with `count=0`

### `modules/favorites`
- Build
  - [x] `Favorite` model + migration, toggle/list endpoints
- Tests (`tests/unit/test_favorites.py`)
  - [x] toggling twice returns to the un-favorited state (idempotent toggle)
  - [x] list-mine only returns the calling user's favorites
  - [x] favoriting the same professional twice doesn't create a duplicate row (unique constraint honored)

### Recently-viewed
- [ ] Client-only (localStorage) — no backend module, no tests here

### `modules/professionals` (extended)
- Build
  - [x] `get_similar(id)` service method + endpoint
- Tests (`tests/unit/test_professionals.py`, extended)
  - [x] similar results exclude the professional itself
  - [x] similar results prioritize same-category matches over others

### `modules/geocoding`
- Build
  - [x] Nominatim client, throttled to respect 1 req/sec usage policy, endpoint + bounding-box search extension on `professionals`
- Tests (`tests/unit/test_geocoding.py`)
  - [x] client throttles a burst of calls to ≤1/sec (mocked clock, no real network in unit tests)
  - [x] a malformed/unresolvable address returns a clean "not found" result, not an unhandled exception
  - [x] bounding-box filter on `professionals` excludes out-of-range lat/lng

### Sort options
- Build
  - [x] query params on existing `professionals` list endpoint (distance/availability/most-booked) — no new module
- Tests
  - [x] each sort mode returns results in the expected order against a fixed fixture set

---

## Phase 3 — Booking & scheduling

**Status (2026-09-02): built and verified.** All 3 sub-areas landed, full `pytest` suite green. Recurring bookings use a cron-triggered admin endpoint (`POST /booking-lifecycle/recurring/run`) rather than an in-process APScheduler job — simpler to test and to trigger from an external scheduler (e.g. a host-level cron hitting the endpoint) without adding a background-scheduling dependency to the app process.

### `modules/availability`
- Build
  - [x] `TimeSlot` model + migration, generate/list/reserve slots, endpoints; `bookings` module calls into this via its service on create/cancel
- Tests (`tests/unit/test_availability.py`)
  - [x] listing open slots excludes already-`is_booked` slots
  - [x] reserving a slot on booking creation is atomic — two concurrent reservation attempts on the same slot: one wins, one gets a clean conflict error (not a corrupted double-booking)
  - [x] releasing a slot on booking cancellation makes it reservable again

### `modules/booking_lifecycle`
- Build
  - [x] reschedule (validates against `availability`), `RecurringBooking` model + migration + a scheduled job (APScheduler or a cron-triggered endpoint) to spin up concrete bookings, cancellation policy + refund against the still-mocked `payments` module
- Tests (`tests/unit/test_booking_lifecycle.py`)
  - [x] reschedule to an already-booked slot is rejected
  - [x] reschedule to an open slot releases the old slot and reserves the new one
  - [x] recurring booking job creates exactly one new `Booking` per due cycle, none for cycles not yet due
  - [x] cancellation inside the cutoff window is rejected (or partially refunded, per policy); outside the window is allowed with full refund
  - [x] refund only ever calls the mock `payments` service, never a real gateway (asserted via mock call inspection)

### Job completion → review prompt
- Build
  - [x] extend `bookings` service's `COMPLETED` transition to call `notifications`
- Tests
  - [x] transitioning a booking to `COMPLETED` triggers exactly one `notify_user` call to the customer

---

## Phase 4 — Communication (SMS + push only)

**Status (2026-09-02): built and verified.** Both sub-areas landed, full `pytest` suite green. `sms` has no router (internal-only, per spec) and no dependency beyond `httpx`, which the app already ships; `push` lazily imports `pywebpush` only inside the actual send call, so the new `pywebpush` optional dependency (`pip install .[push]`) is only needed in an environment that sends real pushes, not for running the app or tests.

### `modules/sms`
- Build
  - [x] open-source/self-hosted gateway client, templated messages, called internally by `bookings`/`contact` (no router — not client-facing)
- Tests (`tests/unit/test_sms.py`)
  - [x] each template (booking confirmed/reminder/status changed) renders with the expected placeholders filled
  - [x] gateway client failure (network error) is caught and logged, never raised up to break the calling booking/contact flow

### `modules/push`
- Build
  - [x] `PushSubscription` model + migration, Web Push (VAPID keys, no paid service), subscribe/unsubscribe endpoints, `notifications` fans out to it
- Tests (`tests/unit/test_push.py`)
  - [x] subscribe stores one row per unique endpoint per user (no duplicates)
  - [x] unsubscribe removes only the matching endpoint
  - [x] a `notify_user` call fans out to all of that user's active subscriptions
  - [x] an expired/invalid subscription (410 from push service) is pruned automatically, not retried forever

---

## Phase 5 — Trust & reviews (no photo uploads)

**Status (2026-09-02): built and verified.** All 3 sub-areas landed, full `pytest` suite green.

### `modules/review_response`
- Build
  - [x] nullable `professional_response`/`responded_at` columns on `reviews`, one-response-per-review endpoint
- Tests (`tests/unit/test_review_response.py`)
  - [x] only the reviewed professional can respond (403 for anyone else)
  - [x] a second response attempt on the same review is rejected

### `modules/disputes`
- Build
  - [x] `Dispute` model + migration, create/list/detail endpoints, admin-only status update (delegated from `admin`)
- Tests (`tests/unit/test_disputes.py`)
  - [x] create requires an authenticated user
  - [x] list-mine only returns the calling user's own disputes (not other users')
  - [x] non-admin cannot change `status`
  - [x] admin status update from `OPEN→RESOLVED` persists `resolution` text

### `modules/verification`
- Build
  - [x] `VerificationRequest` model + migration, submit endpoint, admin approve/reject flips `professionals.verified`
- Tests (`tests/unit/test_verification.py`)
  - [x] submit requires the caller to own a `Professional` profile
  - [x] admin approve sets `professionals.verified=True` and request `status=APPROVED`
  - [x] admin reject leaves `verified=False` and records `reviewed_by`/`reviewed_at`
  - [x] a non-admin cannot approve/reject

---

## Phase 6 — Professional-side tools

**Status (2026-09-02): built and verified.** All 4 sub-areas landed, full `pytest` suite green.

### `modules/earnings`
- Build
  - [x] read-only aggregation over `bookings`+`payments` services, endpoint
- Tests (`tests/unit/test_earnings.py`)
  - [x] totals match a hand-computed sum over a fixture set of paid bookings
  - [x] unpaid/pending bookings are excluded from the "earned" total but shown separately as "pending"
  - [x] a professional only ever sees their own earnings, never another's

### `modules/service_area`
- Build
  - [x] `service_radius_km` column on `professionals`, update endpoint, radius filter reusing `geocoding`
- Tests (`tests/unit/test_service_area.py`)
  - [x] radius update rejects negative/zero values
  - [x] search filter correctly includes/excludes professionals at the radius boundary (inclusive boundary test)

### `modules/portfolio`
- Build
  - [x] add/remove/reorder images, ownership checks; depends on Phase 8's `uploads` (interim: raw URLs)
- Tests (`tests/unit/test_portfolio.py`)
  - [x] only the owning professional can add/remove/reorder their portfolio
  - [x] reorder persists the new order and a subsequent list reflects it

### Availability calendar management
- [x] professional-facing endpoints reusing `availability` module — covered by `test_availability.py`, no new test file

---

## Phase 7 — Admin panel

### `modules/admin`
- Build
  - [ ] `require_role("ADMIN")`-gated router; `user_service` (list/search/suspend, reuses `users`/`professionals`), `analytics_service` (aggregates over existing tables), `dispute_service` (thin delegation to `disputes`/`verification`)
- Tests (`tests/unit/test_admin.py`)
  - [ ] every admin route returns 403 for a non-admin caller (parametrized over all admin routes)
  - [ ] suspend sets a user inactive and a suspended user's subsequent `get_current_user` calls are rejected
  - [ ] analytics totals match hand-computed fixture sums
  - [ ] `dispute_service`/verification delegation calls the underlying module's service, not its repository directly (enforces the layering rule via a mock/spy)

---

## Phase 8 — Platform / infra (last)

### `modules/uploads`
- Build
  - [ ] local disk or self-hosted MinIO (S3-compatible, open-source) adapter, `upload_file()`, mime/size validation; wires into `portfolio` + avatars
- Tests (`tests/unit/test_uploads.py`)
  - [ ] oversized file rejected before hitting storage
  - [ ] disallowed mime type rejected
  - [ ] successful upload returns a retrievable URL

### Geocoding hardening
- Build
  - [ ] caching layer over `modules/geocoding` to avoid re-hitting Nominatim
- Tests (extend `test_geocoding.py`)
  - [ ] identical address lookup within the cache TTL doesn't call the client twice (mock call-count assertion)
  - [ ] cache expiry re-triggers a real lookup

### Testing infra itself
- [ ] `tests/e2e/` — Playwright against the running frontend+backend pair for: signup→login, booking creation→payment→completion→review, admin verification approval
- [ ] CI wiring: `pytest` + `alembic upgrade head` against a throwaway test DB on every push

### SEO / PWA
- [ ] Stay entirely in Next.js (`generateMetadata`, `app/sitemap.js`, service worker/manifest) — no backend involvement, no backend tests

---

## Cross-module dependency map

| Module | Depends on (via service layer only) |
|---|---|
| `contact` | `sms` (stubbed until Phase 4) |
| `booking_lifecycle` | `availability`, `payments`, `notifications` |
| `sms` | consumed by `contact`, `bookings`, `booking_lifecycle` |
| `push` | consumed by `notifications` |
| `admin` | `disputes`, `verification`, `users`, `professionals` |
| `earnings` | `bookings`, `payments` |
| `service_area` | `geocoding` |
| `portfolio` | `uploads` (interim: raw URLs) |

## Tracking rule

A module isn't done until **both** its checklists are checked:
- **Build**: migration applied (`alembic upgrade head` succeeds), module's router is mounted and reachable (`/docs` shows it, manual/`curl` smoke test passes).
- **Tests**: its `tests/unit/test_<module>.py` file exists and every listed case passes under `pytest`.

Log a one-line completion note under the relevant phase heading once both are done, same convention `BACKEND_PLAN_JS_LEGACY.md` used.
