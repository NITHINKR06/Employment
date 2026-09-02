# Frontend Wiring Plan — connecting Phases 2–7 to the UI

`docs/BACKEND_PLAN.md` Phases 0–7 are done and tested at the API level (see
that file's per-phase `pytest` counts), but **the Next.js frontend was never
updated to call most of it**. Phase 0/1 endpoints (professionals, bookings,
payments, reviews, notifications, settings, contact) are wired up and working
end to end. Everything from Phase 2 onward exists only as a tested backend
endpoint — a real user clicking through the site never reaches it.

This doc lists, phase by phase, what's missing on the frontend, which files
it touches, and how to manually verify each one once wired. Follow the same
convention as `BACKEND_PLAN.md`: check items off and add a one-line **Status**
note under a phase heading once it ships, so this file stays a reliable map
of what's real vs. planned.

---

## Conventions to follow (established this session)

- **Client components + `apiFetch` for anything authenticated.** Server
  Components have no access to the browser's Firebase ID token, so any page
  needing the current user's data must be `"use client"` and use
  `@/lib/apiClient`'s `apiFetch` — see `src/app/(app)/user/bookingStatus/page.jsx`
  for the reference pattern (loading/error state, `useEffect` fetch).
- **`serverApiFetch` only for public, unauthenticated data** fetched in a
  Server Component (see `src/lib/serverApiClient.js`), e.g. category counts
  on the marketing page.
- **Ownership/role checks are cosmetic on the frontend, real on the backend.**
  The backend already 403s incorrectly-scoped requests; the frontend only
  needs to hide/disable actions a user can't perform and handle the 403
  gracefully (don't re-implement the check, just don't dead-end the user).
- **New backend response shapes are camelCase** (`professionalResponse`,
  `serviceRadiusKm`, etc.) — match them exactly in the JSX, no local renaming.

---

## Phase 2 — Discovery & search UI

**Status (2026-09-02): built and verified.** Verified by re-checking every touched endpoint's response shape directly against the new frontend code (`curl` with a `dev-` bearer token) and confirming each page compiles/renders with no server or console errors in the Docker logs — not a full click-through in a real browser (no browser automation available in this environment). Flag anything that looks off in manual QA later.

### Categories
- Backend: `GET /categories` → `{id, name, count}[]`
- Work:
  - [x] `(marketing)/page.js`: replaced the hardcoded `CATEGORIES` array's counts with real data from `serverApiFetch("/categories")` (icon/color mapping, now `CATEGORY_DISPLAY`, stays keyed by category name; unseeded categories like Handyman/HVAC correctly show 0).
  - [x] `search/page.jsx` + `FilterPanel.jsx`: category checklist now sourced from `/categories` (fetched client-side) instead of derived from the loaded professionals, each with its live count; a category with 0 professionals still shows.
- Test: verified `GET /categories` counts (1 each for the 4 seeded trades, 0 for others) render correctly in the home page's SSR HTML.

### Favorites
- Backend: `POST /favorites/{professionalId}/toggle`, `GET /favorites`
- Work:
  - [x] New self-contained `components/Favorite/FavoriteButton.jsx` — checks its own status on mount (`GET /favorites`) and toggles via the endpoint above; usable from both client and Server Component parents without prop drilling.
  - [x] `WorkerCard.jsx`: heart button on both `FullCard` (absolute top-right of the image) and `CompactCard` (restructured out of the wrapping `<Link>` to avoid nesting a button inside an anchor).
  - [x] `professionals/[id]/page.jsx`: same button next to the name in the header banner.
  - [x] New `user/favorites/page.jsx` (client component, `apiFetch("/favorites")`), linked from the user nav (`TopNavBar.jsx`).
- Test: `POST .../toggle` → `{favorited: true}`, `GET /favorites` → `{professionals: [...]}` in the exact shape `WorkerCard` expects; toggled and un-toggled live against the seeded professional to confirm both directions work and left state clean.

### Similar professionals
- Backend: `GET /professionals/{id}/similar`
- Work:
  - [x] `professionals/[id]/page.jsx`: "You may also like" section using `serverApiFetch`, rendered with `WorkerCard`.
- Test: confirmed live — returns the other 3 seeded professionals, excluding the one being viewed.

### Geocoding
- Backend: `GET /geocoding/search?address=`
- Work:
  - [x] `search/page.jsx`: location input now calls `/geocoding/search` on Enter/blur, stores `{nearLat, nearLng}`, shows an inline error on failure instead of a raw fetch error.
- Test: confirmed live — `?address=Bangalore` resolves to real coordinates via Nominatim.

### Sort options + bounding box
- Backend: `GET /professionals?sort=rating|distance|availability|most_booked&nearLat=&nearLng=`
- Work:
  - [x] `search/page.jsx`: sort `<select>` keeps `rating`/`price`/`experience` as client-side sorts (no backend equivalent) and adds `distance`/`availability`/`most_booked`, which instead re-fetch `/professionals` with the matching `sort` (and `nearLat`/`nearLng` for `distance`) query params — the results `useMemo` no longer re-sorts a backend-ordered list.
- Test: confirmed live — `most_booked`, `availability`, and `distance` (with real coordinates) each return a distinctly-ordered list matching direct `curl` calls.

### Recently-viewed
- Client-only (localStorage), no backend — not part of this plan.

---

## Phase 3 — Booking & scheduling UI

**Status (2026-09-03): built and verified live against real Postgres (not just SQLite unit tests).** This phase surfaced a real backend bug — see below — fixed as part of this work.

**Backend bug found and fixed:** `create_booking` pre-generated the booking id and reserved the slot (`UPDATE time_slots SET booking_id=...`) *before* the `Booking` row existed. SQLite (used by `pytest`) doesn't enforce foreign keys, so all 100 backend tests passed anyway — but real Postgres does, and every slot-based booking failed with a 500 (`ForeignKeyViolationError`) the moment this was tested live in Docker. Fixed by creating the `Booking` row first, then reserving the slot, with a compensating delete if the slot turned out to be taken (`ConflictError`) — see `bookings/service.py::create_booking` and the two new regression tests in `test_bookings.py`. This is exactly the kind of bug that only shows up when you actually run the thing end to end, which is why this phase's checklist was verified live via `curl` against the Dockerized stack rather than only reading code.

### Availability slots
- Backend: `GET /availability/{professionalId}` (public, open slots), `POST /availability/{professionalId}/generate` (owner/admin)
- Work:
  - [x] `book/[id]/BookingWizard.jsx`: the "Schedule" step now fetches open slots and renders them grouped by day; if a professional has none yet, it falls back to the original free-text date/time inputs (so booking still works for unstaffed demo data) instead of dead-ending the flow.
  - [x] New `employee/availability/page.jsx`: date-range + slot-duration form calling `POST /availability/{professionalId}/generate`, plus a live open-slots list. (No booked-slots list — see gap below.)
- Test (live, via `curl` + a scratch professional/customer): generated 8 slots, booked one — confirmed it dropped out of the public open-slots list (8→7) and the booking response's `date`/`time` matched the slot.

### Reschedule
- Backend: `POST /booking-lifecycle/bookings/{id}/reschedule` (body: `{newSlotId}`)
- Work:
  - [x] New shared `components/Booking/RescheduleAction.jsx` — expands into an open-slot picker scoped to the booking's professional, calls the endpoint, shows a clean message on a 409 (slot taken).
  - [x] Wired into both `user/bookingStatus/[id]/page.jsx` and `employee/bookingStatus/[id]/page.jsx`, gated on `booking.professionalId` (see backend addition below) and a non-terminal status.
- **Backend addition:** `_to_summary_shape()` in `bookings/service.py` didn't include `professionalId` at all — the reschedule UI has no way to know which professional's slots to fetch without it. Added the field (additive, no migration, all 102 tests still pass).
- Test (live): rescheduled a booking to a different open slot — confirmed the old slot re-opened and the booking's `time` updated to the new slot's time.

### Cancel with policy + refund
- Backend: `POST /booking-lifecycle/bookings/{id}/cancel` (24h cutoff, mock refund if paid)
- Work:
  - [x] `BookingStatusActions.jsx`: the "Cancel" action now special-cases `status === "CANCELLED"` to call the `booking-lifecycle` cancel endpoint instead of the plain `PATCH /bookings/{id}`, so the cutoff/refund policy actually applies.
- Test (live): cancelled a booking scheduled several days out — succeeded and released its slot back to open, matching the "outside cutoff" path (no payment existed on the test booking to check refund against; the backend's own `test_booking_lifecycle.py` already covers the paid+refunded case).

### Recurring bookings
- Backend: `POST /booking-lifecycle/recurring` (user-facing), `POST /booking-lifecycle/recurring/run` (admin/cron-only — not for the frontend)
- Work:
  - [x] `BookingWizard.jsx`: "Repeat this booking automatically" checkbox + frequency select in the Address step; when checked, submits to `/booking-lifecycle/recurring` instead of `/bookings` and skips the Payment step (the backend's recurring job doesn't collect payment upfront), redirecting straight to `/user/bookingStatus`.
  - [ ] A management view for a user's *existing* recurring bookings is still not built — **confirmed backend gap**: there is no list endpoint, only create + admin-run. Left as a deliberate gap; note it if this becomes a priority.
- Test (live): created a recurring booking via the endpoint directly — response shape matches what the UI expects (`nextRunAt`, `frequency`, `active`).

### Completion → review prompt
- Backend: already fires a `notify_user` call on `COMPLETED`; no new endpoint.
- Work: none — `BookingReviewForm` already renders when `status === "Completed" && !reviewed`.
- Test: not re-verified live this pass (no changes here); covered by the backend's own `test_bookings.py::test_completion_notifies_the_customer_exactly_once`.

---

## Phase 4 — Communication UI

### Push notifications
- Backend: `POST /push/subscribe`, `POST /push/unsubscribe` (VAPID Web Push)
- Work:
  - [ ] A service worker (`public/sw.js`) handling `push` events.
  - [ ] Settings page (`user/settings`, `employee/settings`) toggle: "Enable push notifications" — on enable, register the service worker, call `PushManager.subscribe()` with the VAPID public key (needs `NEXT_PUBLIC_VAPID_PUBLIC_KEY` exposed from `backend`'s `vapid_public_key`), then `POST /push/subscribe` with the resulting subscription; on disable, `POST /push/unsubscribe`.
- Test: enable push in one browser, trigger a notification (e.g. complete a booking) from another session, confirm an OS-level push notification appears. This needs real VAPID keys generated and set in `backend/.env` — they're empty by default.

### SMS
- Backend-internal only (`sms` module has no router) — nothing for the frontend to call. No work here.

---

## Phase 5 — Trust & reviews UI

**Status (2026-09-02): built and verified live** — created a scratch professional/customer, ran a booking through to `COMPLETED`, and exercised every endpoint below end to end via `curl`; every response shape matches the frontend code exactly.

### Review responses
- Backend: `POST /reviews/{reviewId}/response` (one per review, professional-only)
- Work:
  - [x] `professionals/[id]/page.jsx`: renders `review.professionalResponse` when present (done as part of Phase 2's similar-professionals pass).
  - [x] New `employee/reviews/page.jsx`: lists the professional's own reviews with an inline reply form for any without a response yet.
- Test (live): posted a response as the reviewed professional — confirmed it round-trips in the review shape (`professionalResponse`, `respondedAt`).

### Disputes
- Backend: `POST /disputes`, `GET /disputes` (mine), `GET /disputes/{id}`
- Work:
  - [x] New `components/Booking/DisputeAction.jsx` — inline "Report an Issue" form, wired into `user/bookingStatus/[id]/page.jsx`.
  - [x] New `user/disputes/page.jsx` (list) and `user/disputes/[id]/page.jsx` (detail, shows resolution once an admin acts), linked from the user nav as "Reports".
- Test (live): filed a dispute against a completed booking — confirmed it appears via both the list and detail endpoints with `status: OPEN`.

### Verification
- Backend: `POST /verification/requests` (professional submits), admin approve/reject in Phase 7
- Work:
  - [x] Rebuilt `employee/settings/page.jsx` — it was a non-functional stub (`console.log` on submit, no data loaded). Now loads/saves the real professional profile via `GET`/`PUT /professionals/{id}` and adds a "Request Verification" section.
- Test (live): submitted a verification request as the unverified test professional — got back `status: PENDING` as expected; admin approve/reject is verified in Phase 7 below.

---

## Phase 6 — Professional-side tools UI

**Status (2026-09-02): built and verified live.**

### Earnings
- Backend: `GET /earnings` → `{earned, pending}`
- Work:
  - [x] New `employee/earnings/page.jsx` — two stat tiles (earned / pending).
- Test (live): confirmed the response shape (`{earned, pending}`) against the test professional (both `0.0` — no paid bookings yet, matches expectation).

### Service area
- Backend: `PATCH /service-area/professionals/{id}` (radius), `GET /service-area/search?lat=&lng=`
- Work:
  - [x] `employee/settings/page.jsx`: "Service Area" section with a radius (km) input.
  - Search page's "Near me" using `/service-area/search` skipped for now — the existing bounding-box + distance-sort combo (Phase 2) already covers the main use case; can revisit later.
- Test (live): `PATCH` with `serviceRadiusKm: 50` → response reflects the new value.

### Portfolio
- Backend: `GET/POST /professionals/{id}/portfolio`, `DELETE .../{imageId}`, `PUT .../order`
- Work:
  - [x] New `employee/portfolio/page.jsx`: add-by-URL form, grid with up/down reorder buttons (simpler and equally functional vs. full drag-and-drop) and a remove button per image. Uses `unoptimized` on `next/image` since arbitrary portfolio URLs can't be pre-whitelisted in `next.config.js`'s `remotePatterns`.
- Test (live): added two images, reordered (swap), removed one — each step's response matches what the page expects (`{images: [{id, url, position}]}`), position values update correctly after reorder.

### Availability calendar management
- Covered above under Phase 3 — same `employee/availability` page.

---

## Phase 7 — Admin panel UI

Entirely new section, `app/(app)/admin/`, none of it exists yet.

- Backend: `GET /admin/users`, `POST /admin/users/{id}/suspend`, `POST /admin/users/{id}/unsuspend`, `GET /admin/analytics`, `GET /admin/disputes`, `POST /admin/disputes/{id}/resolve`, `POST /admin/verification/{id}/approve`, `POST /admin/verification/{id}/reject`
- Work:
  - [ ] `admin/layout.jsx`: client-side gate — on mount, `apiFetch("/auth/me")`, redirect away if `role !== "ADMIN"` (the backend still enforces this for real; this is just so a non-admin doesn't see a flash of admin UI or a wall of 403 errors).
  - [ ] `admin/users/page.jsx`: search box + table, suspend/unsuspend buttons per row.
  - [ ] `admin/analytics/page.jsx`: stat tiles for `totalUsers`/`totalProfessionals`/`totalBookings`/`totalRevenue`.
  - [ ] `admin/disputes/page.jsx`: list + a resolve modal (resolution text → `POST .../resolve`).
  - [ ] `admin/verification/page.jsx`: pending-requests queue with approve/reject buttons (note: the backend has no "list pending" endpoint yet — either add one, or have this page filter `GET /verification/requests`... **check**: only `submit`/`approve`/`reject` exist today, no list endpoint at all. This is a backend gap: add `GET /verification/requests?status=PENDING` before building this specific page.).
- Test: log in as a seeded admin account (promote a user's `role` to `ADMIN` directly in the DB for testing — there's no UI to do this, intentionally), suspend a test user and confirm their next login is rejected with "account suspended"; resolve a dispute and confirm the reporting user sees the resolution; approve a verification request and confirm the professional's `verified` flag flips on their public page.

---

## Known backend gaps surfaced while planning this

Two small things the frontend plan above depends on that don't exist yet:
1. **No endpoint to list a user's recurring bookings** (Phase 3) — only create + admin-run exist.
2. **No endpoint to list verification requests** (Phase 7 admin queue) — only submit/approve/reject exist, admin has nothing to page through.

Either add these two small endpoints when their corresponding frontend page is built, or note them as deliberately deferred.

---

## Suggested execution order

Mirror the backend's phase-wise, one-commit-per-phase approach so this stays reviewable:
1. Phase 2 (discovery/search) — highest visibility, touches the homepage and search, no auth complexity.
2. Phase 3 (booking/scheduling) — the core money-flow, most user-facing value.
3. Phase 5 (trust/reviews) + Phase 6 (professional tools) — professional-side, can go in either order.
4. Phase 7 (admin) — last, since it's an entirely separate section with no dependency on the others.
5. Phase 4 (push) — do last or skip initially; it needs real VAPID keys and a service worker, which is more infra than UI.

For each phase: wire it, click through the test checklist above against the live Docker stack, then commit — same discipline as the backend phases.
