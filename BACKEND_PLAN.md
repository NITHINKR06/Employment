# Backend Architecture Plan

Stack: Firebase Authentication (auth only) + PostgreSQL via Prisma (all app data) + Next.js Route Handlers as the API layer.

## 1. Folder structure (clean separation, no dumping into one file)

```
src/
  server/
    db/
      client.js              # Prisma client singleton
    auth/
      firebaseAdmin.js        # Firebase Admin SDK init (server-side token verification)
      session.js              # session cookie helpers (set/get/clear)
      requireAuth.js           # middleware-style guard for route handlers
    services/                 # business logic, one file per domain
      user.service.js
      professional.service.js
      booking.service.js
      payment.service.js
    repositories/             # Prisma queries, one file per model
      user.repository.js
      professional.repository.js
      booking.repository.js
      payment.repository.js
    validators/                # zod schemas per domain
      auth.schema.js
      booking.schema.js
      professional.schema.js
    utils/
      apiResponse.js           # consistent { success, data, error } envelope
      errors.js                # typed AppError classes

  app/api/
    auth/
      session/route.js         # POST: exchange Firebase ID token -> server session cookie
      logout/route.js
      me/route.js
    professionals/
      route.js                 # GET list/search+filters, POST create (employee)
      [id]/route.js            # GET, PATCH, DELETE
    bookings/
      route.js                 # GET (mine), POST create
      [id]/route.js            # GET, PATCH (status updates)
    payments/
      route.js                 # POST create/confirm
      [id]/route.js

  lib/
    firebaseClient.js           # client-side Firebase SDK init (for login/signup forms)

prisma/
  schema.prisma
  migrations/
```

Rule: route handlers stay thin (parse → validate → call service → respond). All logic lives in `services/`, all DB access in `repositories/`. This is what makes migrating later (e.g. swapping Postgres for something else, or Firebase Auth for another provider) contained to one layer.

## 2. Auth flow (Firebase Auth, strong + standard)

- Client: Firebase JS SDK handles signup/login/password reset/Google sign-in directly (email verification too) — this replaces the currently-fake login/signup forms.
- Client gets a Firebase ID token, sends it once to `POST /api/auth/session`.
- Server (Firebase Admin SDK) verifies the ID token, then mints an httpOnly, secure session cookie (Firebase's `createSessionCookie`, ~2 week expiry) — no raw ID tokens floating around in localStorage.
- Every protected API route calls `requireAuth()`, which reads the session cookie, verifies it via Admin SDK, and attaches `{ uid, email }` to the request.
- On first authenticated session-cookie exchange, we upsert a row in Postgres `User` table keyed by Firebase `uid`, carrying `role` (user/employee), profile fields, etc. — Firebase owns identity, Postgres owns app data, joined by `firebaseUid`.
- Role-based access: `role` lives in Postgres (not Firebase custom claims) so it's easy to query/join with bookings — service layer checks role before mutating.

## 3. Data model (Prisma / Postgres)

- `User` (id, firebaseUid unique, email, name, role: USER|EMPLOYEE|ADMIN, phone, createdAt)
- `Professional` (id, userId FK→User, title, trade, yearsExperience, hourlyRate, bio, location, verified, ratingAvg, reviewCount)
- `Skill`, `ProfessionalSkill` (many-to-many) — replaces the flat `skills: []` array so search/filter can query relationally
- `PortfolioImage` (professionalId FK, url)
- `Service` (professionalId FK, title, subtext, price)
- `Booking` (id, userId FK, professionalId FK, serviceId FK, status enum: PENDING|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED, scheduledAt, address, notes, createdAt)
- `Payment` (id, bookingId FK unique, amount, status enum: PENDING|PAID|FAILED|REFUNDED, provider, providerRef, createdAt)
- `Review` (id, bookingId FK, rating, comment) — feeds `Professional.ratingAvg`

## 4. Migration/replacement of current mock data

- `src/data/professionals.js` → seed script (`prisma/seed.js`) that inserts the same 4 professionals into Postgres, so nothing visually breaks.
- Pages currently importing `professionals.js` / hardcoded booking status get switched to `fetch('/api/...')` calls (client) or server components calling the service layer directly.

## 5. Order of implementation

1. Prisma + Postgres setup, schema, migration, seed (mirrors existing mock data)
2. Firebase Admin/client setup + session-cookie auth route + `requireAuth`
3. Wire real signup/login/logout pages to Firebase, replacing the fake `handleLogin`
4. `User` upsert-on-login + role selection persisted
5. Professionals API (list/search/filter, detail) — swap `search/page.jsx`, `professionals/[id]/page.jsx` off mock data
6. Bookings API (create, list mine, status update) — wire `BookingWizard.jsx`, booking status pages
7. Payments API (create/confirm) — wire `PaymentForm.jsx`
8. Employee dashboard endpoints (professional's own bookings/earnings)

## 6. Env vars needed

`DATABASE_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (admin), `NEXT_PUBLIC_FIREBASE_*` (client config).

## 7. Phase-wise execution

Each phase ships independently and is verified (build passes, manual smoke test) before moving to the next. No phase touches work belonging to a later phase.

- [x] **Phase 0 — Scaffolding**
  Installed `prisma`/`@prisma/client` (pinned 6.19.3), `firebase`, `firebase-admin`, `zod`. Added `.env.example` / `.env`. Local Postgres via `docker-compose.yml` (port 5433, container `promarket-postgres`, since 5432 was taken by another project).

- [x] **Phase 1 — Database layer**
  `prisma/schema.prisma` with all models (User, Professional, Skill, ProfessionalSkill, TrustBadge, PortfolioImage, Service, Booking, Payment, Review). Initial migration applied (`prisma/migrations/20260830073757_init`). `src/server/db/client.js` singleton. `prisma/seed.mjs` mirrors `src/data/professionals.js` (4 professionals, skills, trust badges, portfolio, services) — verified via a direct query, relations intact. Run with `pnpm db:seed`.

- [ ] **Phase 2 — Auth foundation**
  `src/lib/firebaseClient.js`, `src/server/auth/firebaseAdmin.js`, `session.js`, `requireAuth.js`. `POST /api/auth/session`, `POST /api/auth/logout`, `GET /api/auth/me`. No UI changes yet — verify with curl/Postman.

- [ ] **Phase 3 — Real signup/login UI**
  Wire `(auth)/auth/signup` and `(auth)/auth/login` pages to Firebase client SDK + `/api/auth/session`. Add `User` upsert-on-first-session with role persisted. Remove the old fake `handleLogin`/mock login route.

- [ ] **Phase 4 — Professionals API**
  `services/professional.service.js`, `repositories/professional.repository.js`, `GET/POST /api/professionals`, `GET/PATCH/DELETE /api/professionals/[id]`. Swap `search/page.jsx` and `professionals/[id]/page.jsx` off `src/data/professionals.js`.

- [ ] **Phase 5 — Bookings API**
  `services/booking.service.js`, `repositories/booking.repository.js`, booking routes. Wire `BookingWizard.jsx` and both booking-status pages (`user/bookingStatus`, `employee/bookingStatus`).

- [ ] **Phase 6 — Payments API**
  `services/payment.service.js`, `repositories/payment.repository.js`, payment routes. Wire `PaymentForm.jsx` and `auth/payment/page.jsx`.

- [ ] **Phase 7 — Employee dashboard + reviews**
  Endpoints for a professional's own bookings/earnings, review creation on completed bookings, `ratingAvg` recompute. Wire `employee/dashboard/page.jsx`.

Proceeding now with **Phase 0**, then **Phase 1**.
