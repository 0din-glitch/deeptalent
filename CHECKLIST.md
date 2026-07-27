# DeepTalent — Platform Audit Checklist

Based on Theo's Action Items and the Phase 1 Website Audit.  
Last updated: 27 July 2026.

---

## Done

### Website Copy & Positioning

- [x] FAQ positioning — "fully managed talent partner, not a marketplace" is the canonical phrase sitewide
- [x] Fake testimonials removed from `/talents` (Sarah Chen, Michael Johnson, Amelia Rodriguez)
- [x] Fake testimonials removed from `/companies` (John Smith/CTO TechStartup, Lisa Wong, Marcus Davis)
- [x] Real client quotes on `/companies` — Dianitte Erilus, CRI Lounge, Al Ahad MD
- [x] `/companies` hero rewritten — was engineering-only; now finance, compliance & technology first
- [x] Broken candidate journey links fixed — "View Open Roles" and "Browse Talent Pool" no longer dead-end
- [x] Cost-led headline deprioritised — AI matching card leads, cost card is second in `StrategicAdvantages`
- [x] "Hundreds of companies" fabricated scale claim removed from homepage CTA
- [x] "game-changing" banned word removed sitewide

### Canonical Claims (sitewide)

- [x] Acceptance rate standardised to **<8%** everywhere (was "top 1%" or "top 3%")
- [x] Time-to-placement standardised to **14–21 days** everywhere (was "21 days")
- [x] Guarantee updated to **60-day free replacement** everywhere (was "14-day trial")
- [x] Salary ranges published on `/talents` — full table from `SALARY_SCALE` data

### Data Integrity

- [x] DB unique constraint on `profiles.email` — prevents multiple rows per email address (`scripts/db/006_profiles_unique_email.sql`)
- [x] Email pre-check in signup action — fails fast with a clear error before creating a duplicate auth user

### SEO & Structured Data

- [x] Root layout `metadata` rewritten — title, description, OpenGraph, Twitter card, robots
- [x] `Organization` JSON-LD injected in root layout — name, URL, logo, address, sameAs (LinkedIn), contactPoint
- [x] `/talents/page.tsx` converted to React Server Component — `"use client"` logic in `components/talents/talents-page-client.tsx`
- [x] `/talents/apply/page.tsx` converted to React Server Component — `"use client"` logic in `components/talents/apply-landing-client.tsx`
- [x] Per-page `metadata` exports on `/talents` and `/talents/apply`

### New Public Pages

- [x] `/roles` — public listing of all 15 disciplines with salary ranges, category filter, and expression-of-interest form; leads stored in `role_interests` table (`scripts/db/007_role_interests.sql`)
- [x] `/roles/[slug]` — 15 individual role landing pages with `generateStaticParams`, per-role `generateMetadata`, and `JobPosting` JSON-LD structured data
- [x] Role content map (`lib/roles/content.ts`) — description, responsibilities, requirements, seniority ranges for every role

### Admin Platform

- [x] Mass Email tab — Compose, Campaign History, and Automations subtabs
- [x] Email automations — scheduled and recurring campaigns with hourly Vercel cron dispatcher
- [x] Calendar tab — real month grid, navigation, click-to-schedule, list toggle
- [x] Social Analytics tab — platform watchlist, YouTube wired to Data API, others stubbed
- [x] Tasks tab — admin task management with delegation
- [x] AI Interview flow — browser-based oral interview, scoring, and qualifying role matching
- [x] Cover letter generator in talent dashboard

---

## Still To Do

### Needs External Credentials / Configuration

- [ ] **Google Calendar self-book page (`/book`)** — the backend OAuth flow and event creation exist; blocked on `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` being set. Once set, a public booking page with real-time slot availability and double-booking prevention can be activated.
- [ ] **Social media post composer** — the monitoring tab exists; publishing to LinkedIn, Instagram, and YouTube requires OAuth write-access tokens per platform. Build the composer UI once platform credentials are confirmed.
- [ ] **YouTube Analytics** — wired in `lib/social/providers.ts` but requires `YOUTUBE_API_KEY` to go live.

### Revenue / Monetisation

- [ ] **Cover letter generator Stripe paywall** — the generator is built and in the talent dashboard; it is currently ungated. Add a Stripe Checkout session to gate it as the first paid product.
- [ ] **Placement stories / case studies** — the talent network section links to LinkedIn but no on-site placement story exists. Publish the first story as soon as a placement is confirmed.

### SEO Content

- [ ] **Content hub / blog** — the audit identifies 70+ days of organic invisibility. A `content/` route with 10–15 articles targeting role-specific keywords (e.g. "hire KYC analyst remotely") is the cheapest durable acquisition channel.
- [ ] **Sitemap and `robots.txt`** — no `sitemap.xml` or `robots.txt` exists. Add via Next.js `app/sitemap.ts` and `app/robots.ts` to include all 15 role landing pages.

### Data & Analytics

- [ ] **Analytics event instrumentation** — no `dataLayer` pushes or analytics SDK calls on any form submit. Wire events on: apply form submit, expression-of-interest submit, cover letter generation, and sign-up completion.
- [ ] **Homepage social skew** — the homepage still anchors VA/admin support visually. Reorder sections to lead with finance and compliance proof before VA/hospitality examples.

---

## Notes

- All DB migrations are in `scripts/db/`. Run each with `node --env-file-if-exists=/vercel/share/.env.project scripts/run-00N-migration.mjs`.
- The cron at `/api/cron/email-automations` runs hourly on Vercel and requires `CRON_SECRET` (set automatically on deploy).
- The `RESEND_API_KEY` environment variable is required for all email sends (manual and automated).
- Role landing pages are statically generated at build time via `generateStaticParams` — no runtime database calls.
