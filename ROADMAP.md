# ProMarket — Feature Roadmap

A running list of features that could be added to ProMarket, based on a survey of the current codebase. Grouped by priority/theme, not by deadline.

## Finish what's stubbed (already exists, but fake)

These already have UI and/or partial plumbing in place — they just don't actually do anything yet.

- **Real payments** — `payment.service.js` is a mock provider that marks every payment `PAID` immediately with a `MOCK-<uuid>` ref. `PaymentForm.jsx` generates a real UPI QR code, but it's not backed by any payment gateway. Needs a real integration (Razorpay/Stripe/etc).
- **Real notifications** — `NotificationsPanel` reads a hardcoded array from `src/data/notifications.js`. No `Notification` DB model, no API route, "Clear all" only clears local component state.
- **User/Employee settings that actually save** — both settings forms just `console.log` on submit; no API call, no persistence, fields aren't even pre-filled with the current user/professional's data.
- **Working contact form** — `/contacts` just flips to a "Thank You" message locally; the message is never sent or stored anywhere.
- **Real password reset** — currently shows a "Coming Soon" overlay. Needs an OTP or magic-link email flow, plus an actual email-sending service (none configured yet).

## Discovery & search

- **Category browsing page** — `trade` is just a free-text string on `Professional` today; a normalized categories page (Plumbing, Electrical, etc.) with icons/counts.
- **Saved/favorite professionals** — bookmark a pro for later; needs a `Favorite` model.
- **Recently viewed professionals**.
- **"Similar professionals" recommendations** on a profile page.
- **Real address/location search** with geocoding — location is currently a static "Bangalore, IN" string everywhere.
- **Advanced sort options** — distance, soonest availability, most booked.

## Booking & scheduling

- **Real calendar/availability slots** — `availability` is just a free-text string ("Available Today"); needs a proper time-slot picker tied to the pro's actual calendar.
- **Booking rescheduling** flow.
- **Recurring bookings** (e.g. weekly cleaning).
- **Cancellation policy + refund handling**.
- **Job completion confirmation flow** — client marks the job done, which triggers a review prompt and payout.

## Communication

- **In-app chat between client and professional** — no messaging system exists at all today; `/contacts` is just a static contact form.
- **Email/SMS notifications** — booking confirmations, reminders, status changes. No email/SMS service (Resend/SendGrid/Twilio) is configured yet.
- **Push notifications** — web push or mobile.

## Trust & reviews

- **Photo uploads in reviews** — currently a review is just a rating + text comment.
- **Professional responses to reviews**.
- **Dispute/report a professional** flow.
- **Background-check verification pipeline** — `verified` is currently just a boolean flag with no verification process behind it.

## Professional-side tools

- **Earnings/payout dashboard** for professionals — bookings exist, but there's no financial reporting.
- **Service area radius setting** — now feasible since professionals have lat/lng from the map feature.
- **Portfolio management UI** — portfolio images exist in the schema; confirm/build the actual upload & edit UI.
- **Availability calendar management**.

## Admin

- **No admin panel exists at all**, despite an `ADMIN` role already being defined in the schema. Needs: professional verification queue, dispute resolution, user management, platform analytics.

## Platform / infra

- **File/image upload** — no upload component exists; avatars are generated via ui-avatars.com and portfolio images are Picsum placeholders.
- **Real geocoding** for the location search field — currently non-functional as an actual filter.
- **Testing** — no test framework (Jest/Vitest/Playwright) is set up at all.
- **SEO** — meta tags/OpenGraph for professional profile pages, sitemap.
- **PWA / installable app** support.
