# ProMarket — Standard Site Essentials

Features every production site typically needs, separate from marketplace-specific functionality (see `ROADMAP.md` for that). Confirmed gaps: no legal pages, no custom error pages, no favicon/manifest in `public/`.

## Legal & compliance

- **Terms of Service / Privacy Policy pages** — none exist; there's a cookie consent banner but no policy it links to.
- **Cookie policy page**.
- **GDPR/CCPA data export & account deletion** — a user can't currently request or delete their own data.

## Standard site plumbing

- **Custom 404 page** — currently just Next.js's default.
- **Custom error page** (`error.js`) for crashes/500s.
- **Favicon + web app manifest** — `public/` has no favicon or `manifest.json` at all.
- **`robots.txt` + `sitemap.xml`** — for SEO crawling.
- **Breadcrumb navigation** on nested pages (profile, booking flow).

## Trust/marketing pages

- **Blog / resources section** (content marketing, SEO).
- **Careers page**.
- **Press/media kit**.
- **Trust & safety page** (separate from the existing "How it Works" `/about`).
- **Partner/affiliate program page**.

## Account & security

- **Two-factor authentication (2FA)**.
- **Active sessions / device management** ("log out of all devices").
- **More social logins** (Apple, Facebook) — Google is already implemented.
- **CAPTCHA/bot protection** on signup and contact forms.

## Growth & engagement

- **Referral program** ("invite a friend, get $X off").
- **Promo codes / discounts**.
- **Loyalty/rewards points**.
- **Newsletter signup + email marketing**.
- **Social share buttons** on professional profiles.

## Observability & ops

- **Error tracking** (Sentry or similar) — a crash is currently silent.
- **Analytics** (GA4/Plausible/PostHog) — no visitor tracking at all currently.
- **Uptime/status monitoring**.
- **Rate limiting** on API routes (auth, contact form, etc. — currently unprotected against abuse).

## Accessibility & i18n

- **WCAG accessibility audit/fixes** (screen reader support, keyboard nav).
- **Multi-language support (i18n)**.
- **Multi-currency support** (if expanding beyond one region).
