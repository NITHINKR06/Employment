# ProMarket — Phase-wise Implementation Plan

Derived from `ROADMAP.md`. This plan sequences everything **except**:
- Real payment gateway integration (stays mocked)
- Real password reset (stays "Coming Soon")
- In-app messaging/chat system
- Email notifications
- Photo uploads in reviews

SMS notifications, where listed, should use an **open-source/self-hosted** option (e.g. a local SMS gateway lib or a free-tier open API) instead of a paid provider like Twilio.

Platform/infra items are pushed to the **last phase** since they're cross-cutting polish, not blocking features.

---

## Phase 1 — Finish what's stubbed (excluding payments & password reset)

- [ ] **Real notifications** — add `Notification` Prisma model, API routes (list, mark-read, clear), wire `NotificationsPanel` to real data instead of `src/data/notifications.js`.
- [ ] **User settings that save** — pre-fill form with current user data, add API route + persistence on submit.
- [ ] **Employee/Professional settings that save** — same as above for professional profile.
- [ ] **Working contact form** — store submission in DB (new `ContactMessage` model) and/or forward via SMS to admin; replace local-only "Thank You" flip.

## Phase 2 — Discovery & search

- [ ] **Category browsing page** — normalize `trade` into a `Category` model; browsing page with icons/counts.
- [ ] **Saved/favorite professionals** — `Favorite` model, bookmark toggle, "My Favorites" page.
- [ ] **Recently viewed professionals** — track via session/local storage + optional DB log.
- [ ] **"Similar professionals" recommendations** — same-category/nearby suggestion block on profile page.
- [ ] **Real address/location search with geocoding** — replace static "Bangalore, IN" with a working geocoding lookup (e.g. Nominatim/OpenStreetMap — open-source).
- [ ] **Advanced sort options** — distance, soonest availability, most booked.

## Phase 3 — Booking & scheduling

- [ ] **Real calendar/availability slots** — replace free-text `availability` with a time-slot model tied to professional's calendar.
- [ ] **Booking rescheduling flow**.
- [ ] **Recurring bookings** (e.g. weekly cleaning).
- [ ] **Cancellation policy + refund handling** (refund logic only against the existing mock payment flow, no real gateway).
- [ ] **Job completion confirmation flow** — client marks job done → triggers review prompt and payout step (payout still mocked).

## Phase 4 — Communication (SMS only, no chat/email)

- [ ] **SMS notifications** — booking confirmations, reminders, status changes, using an open-source/self-hosted SMS solution.
- [ ] **Push notifications** — web push (browser Notification API + service worker), no mobile app needed yet.

## Phase 5 — Trust & reviews (excluding photo uploads)

- [ ] **Professional responses to reviews** — allow a pro to post one reply per review.
- [ ] **Dispute/report a professional flow** — report form + `Dispute`/`Report` model, status tracking.
- [ ] **Background-check verification pipeline** — replace boolean `verified` flag with a verification request/approval workflow (manual admin approval is fine for v1).

## Phase 6 — Professional-side tools

- [ ] **Earnings/payout dashboard** — financial reporting UI built on existing booking data (payouts still simulated).
- [ ] **Service area radius setting** — using existing professional lat/lng.
- [ ] **Portfolio management UI** — upload & edit UI for portfolio images (can reuse Phase 8 file-upload component once built, or use a simple base64/local upload interim).
- [ ] **Availability calendar management** — professional-facing UI to manage the Phase 3 time-slot model.

## Phase 7 — Admin panel

- [ ] **Admin panel scaffold** — route/layout gated by `ADMIN` role.
- [ ] **Professional verification queue** — approve/reject pending verification requests (from Phase 5).
- [ ] **Dispute resolution UI** — view/act on reports from Phase 5.
- [ ] **User management** — list/search/suspend users & professionals.
- [ ] **Platform analytics** — bookings, revenue (mocked), signups, category breakdown.

## Phase 8 — Platform / infra (last, cross-cutting)

- [ ] **File/image upload component** — real upload for avatars & portfolio (replacing ui-avatars.com/Picsum placeholders); pairs with Phase 6 portfolio UI.
- [ ] **Real geocoding for location filter** — finalize/harden the Phase 2 geocoding integration as an actual search filter.
- [ ] **Testing setup** — Jest/Vitest for unit tests, Playwright for e2e.
- [ ] **SEO** — meta tags/OpenGraph for professional profile pages, sitemap.
- [ ] **PWA / installable app support**.

---

## Explicitly excluded (do not implement for now)

- Real payment gateway (Razorpay/Stripe/etc.) — mock provider stays.
- Real password reset (OTP/magic-link + email) — "Coming Soon" overlay stays.
- In-app chat/messaging between client and professional.
- Email notification service.
- Photo uploads in reviews.
