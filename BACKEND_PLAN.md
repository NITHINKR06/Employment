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

- [x] **Phase 2 — Auth foundation**
  `src/lib/firebaseClient.js` (Firebase JS SDK, lazy/tolerant of placeholder config), `src/server/auth/firebaseAdmin.js` (lazy-initialized Admin SDK so missing env vars don't crash the build), `session.js` (httpOnly cookie helpers), `requireAuth.js` (`getCurrentUser`/`requireAuth`/`requireRole`, resolves the Postgres `User` from the verified Firebase uid). Routes: `POST /api/auth/session` (verifies ID token, mints session cookie, upserts `User`), `POST /api/auth/logout`, `GET /api/auth/me`. Also added `src/server/utils/apiResponse.js` + `errors.js` for a consistent envelope. Verified via curl: `/me` returns `{user: null}` with no cookie; `/session` correctly errors until real Firebase Admin credentials are supplied (`FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY` in `.env`). No UI changes yet.

- [x] **Phase 3 — Real signup/login UI**
  `src/lib/authClient.js`: `signUpWithEmail`/`signInWithEmail`/`signOutUser`, wrapping the Firebase client SDK and exchanging the ID token for a session cookie via `/api/auth/session` (role persisted on signup). Firebase client auth (`src/lib/firebaseClient.js`) made lazy/browser-only — calling `getAuth()` at import time broke static prerendering of `/auth/signup` with placeholder keys. `(auth)/auth/login` and `(auth)/auth/signup` pages now call these instead of faking `router.push`, redirect based on the returned `user.role`, and show real Firebase error messages. Removed the old fake `/api/auth/login` mock route (unused, superseded by `/api/auth/session`). Verified: `pnpm build` succeeds, both pages render (200) in dev. Actual sign-in/sign-up will only work once real Firebase credentials are added to `.env`. `resetpassword` page is untouched (still a fake OTP flow) — out of scope for this phase, flagged for later.

- [x] **Phase 4 — Professionals API**
  `repositories/professional.repository.js` (Prisma queries with skills/trustBadges/portfolio/services includes, search/trade/rate/rating filters), `services/professional.service.js` (maps DB shape to the flat UI shape: `rating`, `skills: string[]`, `trustBadges: string[]`, `portfolio: string[]`, `servicesOffered: [{title, subtext, price}]`, plus ownership checks on update/delete), `validators/professional.schema.js` (zod). Routes: `GET/POST /api/professionals`, `GET/PATCH/DELETE /api/professionals/[id]` (write routes require auth/ownership, not yet wired to any UI — that's Phase 7/8).
  `search/page.jsx` now fetches `/api/professionals` on mount instead of importing the mock array (categories derived from the fetched list; added a loading state). `professionals/[id]/page.jsx` and `book/[id]/page.jsx` (both server components) now call the service layer directly and use `generateStaticParams` against the DB; 404s via `notFound()` on `NotFoundError`. `src/data/professionals.js` is left in place — still used by the marketing homepage and `user/dashboard`, out of scope here.
  Verified: `pnpm build` succeeds (SSG pages now build with real DB-generated cuids), `/api/professionals` returns the expected shape, professional detail/search/booking pages all 200, unknown id 404s correctly.

- [x] **Phase 5 — Bookings API**
  `repositories/booking.repository.js`, `services/booking.service.js` (maps `Booking` to the `BookingSummaryRow`/detail shape per viewer role — customer sees the professional as counterpart, professional sees the client; status enum mapped to display labels `Pending/Confirmed/In Progress/Completed/Cancelled`; ownership checks; a small allowed-status-transition table: professional drives `CONFIRMED→IN_PROGRESS→COMPLETED`, either side can `CANCELLED` from a non-terminal state), `validators/booking.schema.js`. Routes: `GET/POST /api/bookings` (mine / create), `GET/PATCH /api/bookings/[id]` (detail / status update).
  `BookingWizard.jsx` now creates a real booking (`POST /api/bookings`) when leaving the Address step, before the Payment step — shows a login prompt if unauthenticated. `user/bookingStatus/page.jsx` fetches `/api/bookings` client-side (same pattern as search). `user/bookingStatus/[id]`, `employee/bookingStatus`, and `employee/bookingStatus/[id]` are server components calling the service layer directly with `requireAuth`/`requireRole`, replacing `src/data/bookings/data.js`. Added `components/Booking/BookingStatusActions.jsx` (client) wiring Cancel/Accept/Decline/Start/Complete buttons to `PATCH /api/bookings/[id]`.
  Verified via a temporary in-app test route (removed after use) exercising the full lifecycle against the real DB: booking creation, listing from both the customer's and professional's side, ownership enforcement (customer blocked from confirming), and the professional-confirm → customer-cancel transition — all passed. `pnpm build` succeeds.

- [x] **Phase 6 — Payments API (mock provider)**
  `repositories/payment.repository.js`, `services/payment.service.js`, `validators/payment.schema.js`. Routes: `POST /api/payments` (pay a booking), `GET /api/payments/[id]`. **Deliberately a mock/dummy payment provider** — `payForBooking` marks the payment `PAID` immediately with `provider: "mock-<method>"` and a random `providerRef`, no real gateway call. This is called out in a comment at the top of `payment.service.js` so swapping in a real gateway (Stripe/Razorpay) later only touches that one function — nothing else in the service/route/UI layer needs to change. Paying a `PENDING` booking auto-confirms it (transaction in the repository).
  `PaymentForm.jsx` takes an optional `bookingId` prop — when present it calls the real endpoint before showing the success screen; when absent (no booking context) it falls back to the original local-only simulated success, unchanged. `BookingWizard.jsx` passes the booking id created in Phase 5. `auth/payment/page.jsx` (the standalone payment portal) reads `bookingId`/`amount` from the query string; the "Go to Payment Portal" link on the user booking detail page now includes both.
  Verified via a temporary in-app test route (removed after use): booking auto-confirms on payment, a second payment attempt on the same booking is rejected, and a payment is inaccessible to a user who doesn't own the booking. `pnpm build` succeeds.

- [x] **Phase 7 — Employee dashboard + reviews**
  Schema: added `Professional.experienceSummary` (nullable text) to properly back the dashboard's existing "Experience" narrative field — small migration (`20260830091043_add_professional_experience_summary`).
  Reviews: `repositories/review.repository.js`, `services/review.service.js` (`createReview` enforces booking ownership + `COMPLETED` status + one review per booking, then recomputes `Professional.ratingAvg`/`reviewCount` from all reviews in the same flow; `listProfessionalReviews` is public), `validators/review.schema.js`. Routes: `POST /api/bookings/[id]/reviews`, `GET /api/professionals/[id]/reviews`. Added `components/Booking/BookingReviewForm.jsx`, shown on a user's booking detail page once its status is `Completed` and unreviewed (booking shape now carries `reviewed`, via `booking.review` in the repository include).
  Employee self-service: `getMyProfessional` (service) + `GET /api/professionals/me`; `getEmployeeSummary` (in `booking.service.js`, reusing `findManyByProfessionalId`) + `GET /api/bookings/summary` — both `EMPLOYEE`/`ADMIN`-gated. `employee/dashboard/page.jsx` rewritten as a client component: shows a "Create Your Professional Profile" form (`POST /api/professionals`) for an employee with no profile yet (real signups don't get one automatically — only seed data does), otherwise loads the real profile + a jobs/earnings stat row + real reviews, and Edit/Save now `PATCH`es `/api/professionals/[id]` (name/email dropped from the edit form since they aren't Professional fields and weren't actually persisted before either).
  Also replaced the hardcoded `MOCK_REVIEWS` on the public `professionals/[id]` page with `listProfessionalReviews`, called directly since it's a server component.
  Verified via a temporary in-app test route (removed after use): profile creation, summary before/after a completed+paid booking, review rejected before completion, rating/reviewCount recompute after a review, double-review rejected, reviews listing count — all correct. `pnpm build` succeeds.

Proceeding now with **Phase 0**, then **Phase 1**.

## 8. Live Firebase verification (2026-08-30)

Real Firebase project `manage-place` credentials (client config + Admin SDK service account) were added to `.env` (gitignored, not committed). Verified end-to-end against the live project and local Postgres via Firebase's Identity Toolkit REST API (simulating what the browser SDK does) plus a temporary in-app cleanup route (removed after use):
- Real signup → `/api/auth/session` → session cookie → `/api/auth/me` all correct
- Authenticated booking creation and listing via the real session cookie
- Test Firebase accounts and their Postgres rows fully cleaned up afterward

Remaining before this is production-ready: rotate/secure the downloaded service-account JSON in `~/Downloads` (delete it once the key is safely stored, e.g. a secrets manager), and set the same env vars in the Vercel project for deployment.
