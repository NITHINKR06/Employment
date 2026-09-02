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

### Categories
- Backend: `GET /categories` → `{id, name, count}[]`
- Work:
  - [ ] `(marketing)/page.js`: replace the hardcoded `CATEGORIES` array with real data from `serverApiFetch("/categories")`, keep the icon/color mapping keyed by category name.
  - [ ] `search/page.jsx` + `FilterPanel.jsx`: source the category checklist from `/categories` instead of `[...new Set(professionals.map(p => p.trade))]`, so a category with 0 professionals still shows (with a `(0)` count).
- Test: visit `/`, confirm category tile counts match `GET /categories`; visit `/search`, confirm every category from the API appears in the filter panel even ones with no results yet.

### Favorites
- Backend: `POST /favorites/{professionalId}/toggle`, `GET /favorites`
- Work:
  - [ ] `WorkerCard.jsx`: add a heart/favorite icon button (both `FullCard` and `CompactCard` variants) that calls `apiFetch(`/favorites/${worker.id}/toggle`, {method: "POST"})` and toggles its filled/outline state from the response's `favorited` boolean.
  - [ ] `professionals/[id]/page.jsx`: same favorite button in the header banner (this page is a Server Component — the button itself must be a small client sub-component, e.g. `FavoriteButton.jsx`, passed `professionalId`).
  - [ ] New page `user/favorites/page.jsx` (client component, `apiFetch("/favorites")`) rendering the list with `WorkerCard`, reachable from the user nav/dashboard.
- Test: favorite a professional from search results, confirm the icon stays filled after a page refresh (i.e. reflects real state, not local-only); confirm it shows up on `/user/favorites`; un-favorite and confirm it disappears.

### Similar professionals
- Backend: `GET /professionals/{id}/similar`
- Work:
  - [ ] `professionals/[id]/page.jsx`: add a "You may also like" section fetching `serverApiFetch(`/professionals/${id}/similar`)` alongside the existing reviews fetch, rendered with `WorkerCard variant="compact"` or similar.
- Test: open a professional's page, confirm the similar-pros row is populated and excludes the professional itself.

### Geocoding
- Backend: `GET /geocoding/search?address=`
- Work:
  - [ ] `search/page.jsx`: wire the existing (currently non-functional) location text input to call `/geocoding/search` on submit/blur, store the returned `{latitude, longitude}`, and pass them as `nearLat`/`nearLng` when listing professionals (see Sort options below). Show a friendly inline error on a 404 (unresolvable address) instead of a raw fetch failure.
- Test: type a real address, confirm it resolves to coordinates and narrows/reorders results; type garbage, confirm a clean "couldn't find that address" message, not a console error.

### Sort options + bounding box
- Backend: `GET /professionals?sort=rating|distance|availability|most_booked&nearLat=&nearLng=&minLat=&maxLat=&minLng=&maxLng=`
- Work:
  - [ ] `search/page.jsx`: the sort `<select>` currently sorts the already-fetched list client-side with only 3 options (`rating`, `price`, `experience`) — hourlyRate/years-experience sort can stay client-side (no backend equivalent), but add `distance`, `availability`, `most_booked` options that instead re-fetch `/professionals` with the matching `sort` query param (and `nearLat`/`nearLng` from the geocoding step above for `distance`).
- Test: switch to each new sort mode and confirm the order actually changes and matches what a direct `curl` of the same query params returns.

### Recently-viewed
- Client-only (localStorage), no backend — not part of this plan.

---

## Phase 3 — Booking & scheduling UI

### Availability slots
- Backend: `GET /availability/{professionalId}` (public, open slots), `POST /availability/{professionalId}/generate` (owner/admin)
- Work:
  - [ ] `book/[id]/BookingWizard.jsx`: replace the free-text date/time inputs in the "Schedule" step with a real slot picker — fetch `apiFetch(`/availability/${worker.id}`)`, render open slots grouped by day, and pass the chosen `slotId` (not raw `scheduledAt`) in the `POST /bookings` body so the backend reserves it atomically.
  - [ ] New professional-facing page/section (e.g. `employee/availability/page.jsx`) with a simple date-range + slot-duration form calling `POST /availability/{professionalId}/generate`, and a read-only list of that professional's slots (open + booked).
- Test: as a professional, generate a week of slots; as a customer, book one — confirm it disappears from the public open-slots list; try to have a second browser tab book the same slot and confirm it gets a clean "already booked" error, not a broken booking.

### Reschedule
- Backend: `POST /booking-lifecycle/bookings/{id}/reschedule` (body: `{newSlotId}`)
- Work:
  - [ ] `user/bookingStatus/[id]/page.jsx` and `employee/bookingStatus/[id]/page.jsx`: add a "Reschedule" action that opens the same slot picker built above (scoped to the booking's professional) and calls this endpoint on selection.
- Test: reschedule a booking to an open slot, confirm the old slot re-opens and the new one shows booked; try rescheduling onto an already-booked slot and confirm a clean rejection.

### Cancel with policy + refund
- Backend: `POST /booking-lifecycle/bookings/{id}/cancel` (24h cutoff, mock refund if paid)
- Work:
  - [ ] `BookingStatusActions.jsx`: the existing "Cancel Booking" action currently does `PATCH /bookings/{id} {status: "CANCELLED"}`, which skips the cutoff/refund logic entirely. Swap it to call the new `booking-lifecycle` cancel endpoint instead, and surface its rejection message (inside the 24h window) directly instead of a generic error.
- Test: cancel a booking scheduled >24h out that has a paid payment — confirm the payment shows `REFUNDED` afterward; try cancelling one scheduled <24h out and confirm it's rejected with the cutoff message.

### Recurring bookings
- Backend: `POST /booking-lifecycle/recurring` (user-facing), `POST /booking-lifecycle/recurring/run` (admin/cron-only — not for the frontend)
- Work:
  - [ ] `BookingWizard.jsx`: add an optional "Repeat this booking" toggle (weekly/biweekly/monthly) in the Schedule or Address step; on submit, if enabled, call `POST /booking-lifecycle/recurring` instead of (or in addition to) the one-off `POST /bookings`.
  - [ ] Somewhere in `user/bookingStatus` or `user/dashboard`, list the user's active recurring bookings (needs a new `GET` list endpoint on the backend first — **not yet built**; flag this as a small backend gap to close before this UI ships, or ship without a management view initially).
- Test: create a recurring booking, then manually call `POST /booking-lifecycle/recurring/run` (as an admin) and confirm exactly one new concrete booking appears for the user.

### Completion → review prompt
- Backend: already fires a `notify_user` call on `COMPLETED`; no new endpoint.
- Work: none — `BookingReviewForm` already renders when `status === "Completed" && !reviewed`.
- Test: mark a booking `COMPLETED` as the professional, confirm (a) the customer's notification bell (`Notify.jsx`) shows the new notification, and (b) the review form appears on that booking's detail page.

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

### Review responses
- Backend: `POST /reviews/{reviewId}/response` (one per review, professional-only)
- Work:
  - [ ] `professionals/[id]/page.jsx`: under each review in "Client Reviews", render `review.professionalResponse` if present (indented, labeled "Response from {professional name}").
  - [ ] A "Respond" action visible only to the reviewed professional — simplest placement: on the professional's own dashboard/bookingStatus detail for a completed+reviewed booking, or a small dedicated `employee/reviews/page.jsx` listing their reviews with an inline reply form.
- Test: as the reviewed professional, post a response; confirm it shows publicly on the professional's page; confirm a second response attempt is rejected in the UI (button disabled or error shown).

### Disputes
- Backend: `POST /disputes`, `GET /disputes` (mine), `GET /disputes/{id}`
- Work:
  - [ ] Booking detail pages (`user/bookingStatus/[id]`, `employee/bookingStatus/[id]`): add a "Report an issue" button opening a small form (subject + description) that calls `POST /disputes` with the booking's id.
  - [ ] New `user/disputes/page.jsx` (list, reusing the `apiFetch` list-page pattern) and `user/disputes/[id]/page.jsx` (detail, showing status/resolution once an admin has acted).
- Test: file a dispute against a booking, confirm it appears on the disputes list with `status: OPEN`; after an admin resolves it (Phase 7 UI below), confirm the detail page shows the resolution text.

### Verification
- Backend: `POST /verification/requests` (professional submits), admin approve/reject in Phase 7
- Work:
  - [ ] `employee/settings/page.jsx` (currently a non-functional stub — see note below): add a "Request verification" button calling `POST /verification/requests`, showing a pending/approved/rejected status once submitted.
- Test: submit a verification request as an unverified professional; confirm the professional's `VerifiedBadge` appears on their public page only after an admin approves it (Phase 7 UI).

---

## Phase 6 — Professional-side tools UI

### Earnings
- Backend: `GET /earnings` → `{earned, pending}`
- Work:
  - [ ] New `employee/earnings/page.jsx` (or a card added to `employee/dashboard/page.jsx`, which already fetches booking summary data) showing earned vs. pending totals.
- Test: pay for a booking, confirm `earned` increases; leave one unpaid, confirm it shows under `pending`, not `earned`.

### Service area
- Backend: `PATCH /service-area/professionals/{id}` (radius), `GET /service-area/search?lat=&lng=`
- Work:
  - [ ] `employee/settings/page.jsx`: add a "Service radius (km)" number input calling the `PATCH` endpoint.
  - [ ] Optional: a "Near me" toggle on `search/page.jsx` using `/service-area/search` instead of the plain bounding-box filter, once the geocoding "use my location" flow (Phase 2) exists.
- Test: set a professional's radius, confirm `GET /service-area/search` at a point just inside it includes them and just outside excludes them (matches the backend's own inclusive-boundary test).

### Portfolio
- Backend: `GET/POST /professionals/{id}/portfolio`, `DELETE /professionals/{id}/portfolio/{imageId}`, `PUT /professionals/{id}/portfolio/order`
- Work:
  - [ ] New `employee/portfolio/page.jsx`: add-by-URL form (raw URL input — file upload is Phase 8, not built), a grid of current images with a remove button each, and drag-to-reorder (even a simple up/down button pair is fine — full drag-and-drop is a nice-to-have) calling `PUT .../order` with the new id sequence.
  - [ ] `professionals/[id]/page.jsx`'s existing "Recent Portfolio" grid already renders `worker.portfolio` — no change needed there once the array is populated and ordered correctly by the backend.
- Test: add two images, reorder them, refresh the professional's public page and confirm the new order persists; remove one and confirm it's gone from both the management page and the public page.

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
