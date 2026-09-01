# Backend Plan — Go (Golang)

Supersedes `BACKEND_PLAN.md` (Python/FastAPI) and `BACKEND_PLAN_JS_LEGACY.md` (JS/Next.js route handlers). The backend is to be built in Go going forward. The Next.js app (`src/app`, `src/components`, etc.) remains as the **frontend only** — communicating with the Go backend over a versioned REST API.

---

## Stack Choice & Rationale

- **Language:** Go (Golang 1.22+)
- **HTTP Router:** `go-chi/chi/v5` (lightweight, idiomatic, standard `http.Handler` compatible, zero reflection overhead)
- **Database / Driver:** `pgx/v5` (high-performance native PostgreSQL driver) + `gorm` ORM (or `sqlc` for type-safe SQL queries)
- **Migrations:** `golang-migrate/migrate/v4` (standard SQL file-based migration runner)
- **Validation:** `go-playground/validator/v10` (struct tag-based validation, standard in Go APIs)
- **Auth:** Firebase Authentication via official `firebase.google.com/go/v4` SDK. Verifies Bearer tokens (`Authorization: Bearer <token>`) per request statelessly.
- **Server:** Built-in `net/http` server with `chi` middleware stack, compiled into a single static binary.

---

## Hard Rules for Every Module

1. `handler.go` = parse HTTP request (decode JSON into DTO struct, validate tags) → call service → write JSON response. No business logic or database queries here.
2. `service.go` = business logic, authorization checks, domain validation. No direct database/SQL calls here.
3. `repository.go` = database interface and SQL/GORM execution for that domain only.
4. `dto.go` / `types.go` = request and response structs with JSON and validate tags.
5. `models.go` = DB table struct definitions for GORM / database mapping.
6. Module boundaries: A module's service never calls another module's repository directly. Cross-domain actions go through the target module's `service.go`.
7. One SQL migration file set (`.up.sql` / `.down.sql`) per database schema change.

---

## Project Folder Structure

```
backend-go/
  cmd/
    server/
      main.go                   # App bootstrapper, CORS, router mounting, graceful shutdown
    seed/
      main.go                   # Data seeder for initial dev/demo database
  migrations/                   # golang-migrate SQL files
    000001_initial_schema.up.sql
    000001_initial_schema.down.sql
  internal/
    core/
      config/                   # Environment variables loader (godotenv / envconfig)
      db/                       # PostgreSQL connection pool setup (pgxpool)
      security/                 # Firebase Admin Go SDK init + AuthMiddleware + RoleMiddleware
      errors/                   # Typed AppError struct & standard HTTP error response mapper
      response/                 # JSON response envelope helpers (success/error)
    modules/
      users/
        models.go    dto.go    repository.go    service.go    handler.go
      professionals/
        models.py    dto.go    repository.go    service.go    handler.go
      bookings/
        models.go    dto.go    repository.go    service.go    handler.go
      payments/
        models.go    dto.go    repository.go    service.go    handler.go
      reviews/
        models.go    dto.go    repository.go    service.go    handler.go
      notifications/
        models.go    dto.go    repository.go    service.go    handler.go
      settings/
        dto.go       service.go    handler.go
      contact/
        models.go    dto.go    repository.go    service.go    handler.go
      categories/
        models.go    dto.go    repository.go    service.go    handler.go
      favorites/
        models.go    dto.go    repository.go    service.go    handler.go
      geocoding/
        client.go    service.go    handler.go
      availability/
        models.go    dto.go    repository.go    service.go    handler.go
      booking_lifecycle/
        reschedule_service.go   recurring_models.go   recurring_repository.go
        recurring_service.go    cancellation_service.go   dto.go    handler.go
      sms/
        client.go    service.go
      push/
        models.go    dto.go    repository.go    service.go    handler.go
      review_response/
        service.go   dto.go    handler.go
      disputes/
        models.go    dto.go    repository.go    service.go    handler.go
      verification/
        models.go    dto.go    repository.go    service.go    handler.go
      earnings/
        service.go   dto.go    handler.go
      service_area/
        service.go   dto.go    handler.go
      portfolio/
        models.go    dto.go    repository.go    service.go    handler.go
      admin/
        user_service.go   analytics_service.go   dispute_service.go
        dto.go            handler.go
      uploads/
        client.go    service.go    dto.go    handler.go

  go.mod
  go.sum
  Makefile
```

---

## Auth Flow (Go + Firebase Admin Go SDK)

1. Client (Next.js): Firebase JS SDK signs in user, obtains Firebase ID Token.
2. Client includes header `Authorization: Bearer <id_token>` on requests.
3. `internal/core/security/middleware.go` (`AuthMiddleware`):
   - Extracts Bearer token from header.
   - Calls `firebaseAuth.VerifyIDToken(ctx, token)`.
   - Fetches or upserts `User` record in PostgreSQL by `firebase_uid`.
   - Stores `*User` struct in `r.Context()`.
4. Role checks (`RequireRole("ADMIN")`): Middleware checking `user.Role == "ADMIN"`, returning 403 Forbidden if unauthorized.
5. CORS: `cors.Handler` enabling origins (e.g. `http://localhost:3000`), methods, and `Authorization` headers.

---

## Phase 0 — Initial Go Port & Core Foundation

### `core` (DB, Config, Security)
- Build
  - [ ] `internal/core/config`: Environment configuration loader
  - [ ] `internal/core/db`: PostgreSQL connection pool setup using `pgxpool` / `gorm`
  - [ ] `migrations/000001_initial_schema.up.sql`: Initial DDL for User, Professional, Skill, ProfessionalSkill, TrustBadge, PortfolioImage, Service, Booking, Payment, Review
  - [ ] `internal/core/security`: Firebase Admin Go SDK initialization, `AuthMiddleware`, `RequireRole`
  - [ ] `internal/core/errors` & `response`: Unified JSON envelope `{ "success": true, "data": ... }` or `{ "success": false, "error": ... }`
- Tests (`internal/core/security/security_test.go`)
  - [ ] `AuthMiddleware` returns 401 on missing/malformed/expired token
  - [ ] `AuthMiddleware` upserts new `User` row on first login
  - [ ] `AuthMiddleware` returns existing `User` row on repeat login
  - [ ] `RequireRole("ADMIN")` returns 403 for non-admin user

### `modules/users`
- Build
  - [ ] `models.go`, `dto.go`, `repository.go`, `service.go`, `handler.go` — `/api/v1/auth/me` endpoint
- Tests (`internal/modules/users/users_test.go`)
  - [ ] Default role assignment (`USER`) on first login
  - [ ] Preserves existing role on subsequent logins
  - [ ] Returns `ErrNotFound` for non-existent user ID

### `modules/professionals`
- Build
  - [ ] Search, filter, list, detail, create, update, delete handlers (`/api/v1/professionals`)
  - [ ] JSON response shapes matching frontend contracts (`skills`, `portfolio`, `trustBadges`, `servicesOffered`)
- Tests (`internal/modules/professionals/professionals_test.go`)
  - [ ] List endpoint applies search, trade, rate, and rating filters
  - [ ] Profile mutation returns 403 if caller is not owner/admin
  - [ ] Profile detail returns 404 for unknown ID

### `modules/bookings`
- Build
  - [ ] Booking status state machine transitions (`PENDING→CONFIRMED→IN_PROGRESS→COMPLETED`, `→CANCELLED`)
  - [ ] Endpoints: `POST /api/v1/bookings`, `GET /api/v1/bookings`, `GET /api/v1/bookings/summary`, `GET /api/v1/bookings/{id}`, `PATCH /api/v1/bookings/{id}`
- Tests (`internal/modules/bookings/bookings_test.go`)
  - [ ] State transitions enforce valid path flow
  - [ ] Disallowed status transition returns validation error
  - [ ] User visibility restricted to customer/professional involved in booking

### `modules/payments` (Mock Provider)
- Build
  - [ ] `POST /api/v1/payments`: Mark booking `PAID` and `CONFIRMED` atomically
- Tests (`internal/modules/payments/payments_test.go`)
  - [ ] Payment transitions pending booking to confirmed state
  - [ ] Double payment rejected for already paid booking
  - [ ] Unauthorized caller cannot initiate payment

### `modules/reviews`
- Build
  - [ ] `POST /api/v1/bookings/{id}/reviews`: Booking completed requirement, single review enforcement, rating recalculation
  - [ ] `GET /api/v1/professionals/{id}/reviews`: Public listing endpoint
- Tests (`internal/modules/reviews/reviews_test.go`)
  - [ ] Review creation blocked if booking not `COMPLETED`
  - [ ] Duplicate review blocked for same booking
  - [ ] Professional `rating_avg` and `review_count` correctly updated after each review

---

## Phase 1 — System Infrastructure & Stubs

### `modules/notifications`
- Build
  - [ ] `Notification` model & migration, `GET /api/v1/notifications`, `PATCH /api/v1/notifications/{id}/read`, `DELETE /api/v1/notifications`
- Tests
  - [ ] Unread notification creation
  - [ ] Mark read updates timestamp idempotently
  - [ ] Notifications scoped strictly per authenticated user

### `modules/settings`
- Build
  - [ ] `GET /api/v1/settings`, `PATCH /api/v1/settings` (composes users and professionals)
- Tests
  - [ ] Retrieves combined user and professional profile settings
  - [ ] Updates persist correctly across components

### `modules/contact`
- Build
  - [ ] `ContactMessage` model & migration, `POST /api/v1/contact`
- Tests
  - [ ] Supports anonymous and authenticated submissions
  - [ ] Validates email format via struct tag rules

---

## Phase 2 — Discovery & Search Features

### `modules/categories`
- Build
  - [ ] `Category` model, migration, backfill professional counts, list endpoint with professional counts
- Tests
  - [ ] Correct count per category
  - [ ] Zero-count categories listed gracefully

### `modules/favorites`
- Build
  - [ ] `Favorite` model & migration, `POST /api/v1/favorites/{id}`, `GET /api/v1/favorites`
- Tests
  - [ ] Toggle favorited state idempotently
  - [ ] List returns user-specific favorited items only

### `modules/geocoding`
- Build
  - [ ] Nominatim HTTP client with 1 req/sec rate limiter, bounding box query helper for professionals
- Tests
  - [ ] Rate limiter respects request interval
  - [ ] Handles unresolvable location names cleanly without panicking

---

## Phase 3 — Scheduling & Booking Lifecycle

### `modules/availability`
- Build
  - [ ] `TimeSlot` model, slot generator, reservation lock helper
- Tests
  - [ ] Reserved slots excluded from available list
  - [ ] Atomic booking slot allocation prevents race conditions

### `modules/booking_lifecycle`
- Build
  - [ ] Reschedule service, `RecurringBooking` model, cancellation window & refund logic
- Tests
  - [ ] Slot swap on reschedule succeeds
  - [ ] Cancellation refund policy strictly applied

---

## Phase 4 — Communications (SMS & Push)

### `modules/sms`
- Build
  - [ ] SMS gateway client wrapper, template formatter (internal calls)
- Tests
  - [ ] Template formatting accuracy
  - [ ] Gateway errors handled gracefully without breaking calling flow

### `modules/push`
- Build
  - [ ] `PushSubscription` model, WebPush VAPID sender, subscription handlers
- Tests
  - [ ] Unique endpoint registration per user
  - [ ] Fan-out delivery sends to all active user endpoints

---

## Phase 5 — Disputes, Verification & Response

### `modules/review_response`
- Build
  - [ ] Response column migration, `POST /api/v1/reviews/{id}/response`
- Tests
  - [ ] Restricts responses strictly to reviewed professional owner

### `modules/disputes`
- Build
  - [ ] `Dispute` model & migration, CRUD endpoints, admin status updates
- Tests
  - [ ] Customer dispute creation
  - [ ] Admin-only status updates (`OPEN → RESOLVED`)

### `modules/verification`
- Build
  - [ ] `VerificationRequest` model, submit endpoint, admin review endpoints
- Tests
  - [ ] Approval sets `professionals.verified = true`

---

## Phase 6 — Professional Analytics & Tools

### `modules/earnings`
- Build
  - [ ] Aggregation over completed bookings & payments, `GET /api/v1/earnings`
- Tests
  - [ ] Accurate calculation of completed revenue vs pending balances

### `modules/service_area`
- Build
  - [ ] `service_radius_km` field on professional profile, location radius search filter
- Tests
  - [ ] Geofence boundaries filter out-of-range professionals

### `modules/portfolio`
- Build
  - [ ] Portfolio image management endpoints
- Tests
  - [ ] Reordering and image additions verified

---

## Phase 7 — Admin Panel APIs

### `modules/admin`
- Build
  - [ ] `RequireRole("ADMIN")` protected endpoints: user management, analytics summary, dispute resolutions
- Tests
  - [ ] Non-admin requests receive 403 Forbidden across all admin routes
  - [ ] User suspension revokes access immediately

---

## Phase 8 — Uploads & Storage Infrastructure

### `modules/uploads`
- Build
  - [ ] Multipart file upload handler, MIME type & size validator, local disk / S3 storage provider
- Tests
  - [ ] File size limit enforcement
  - [ ] Invalid MIME types rejected with HTTP 400

---

## Containerization & Docker Wrapup

### Go Multi-Stage Dockerfile (`backend-go/Dockerfile`)
- **Stage 1 (Build)**: `golang:1.22-alpine` — compile `cmd/server/main.go` with `CGO_ENABLED=0 GOOS=linux` into a static binary `/app/server`.
- **Stage 2 (Production Runner)**: Minimal `alpine:3.19` (or `scratch`) container carrying only ca-certificates, tzdata, and the compiled static binary (~15MB image size).

### Docker Compose Integration (`docker-compose.yml`)
- Update `backend-go` service container configuration:
  - Context: `./backend-go`
  - Environment: `DATABASE_URL=postgresql://promarket:promarket@postgres:5432/promarket_go?sslmode=disable`
  - Depends on `postgres` healthcheck condition (`service_healthy`).
  - Exposes port `8000:8000`.
- Update `docker/init-db.sql`:
  - Add `CREATE DATABASE promarket_go;` alongside existing PostgreSQL init scripts.

---

## Frontend Cutover Tasks

- [ ] Update frontend environment variable `NEXT_PUBLIC_API_URL` to point to Go backend (`http://localhost:8000/api/v1`)
- [ ] Implement `apiClient.js` helper in Next.js to attach `Authorization: Bearer <idToken>`
- [ ] Seed Go database (`promarket_go`) using `cmd/seed/main.go`
- [ ] Run complete `go test ./...` test suite and verify 100% green
- [ ] Build & launch with `docker compose up --build` to verify full containerized stack
- [ ] Remove legacy `frontend/src/app/api/*` Next.js route handlers once parity is verified
