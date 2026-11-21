# MentorLagbe

A clean, modern tutoring marketplace frontend — **students** find tuition batches & mentors, **tutors** post and manage listings, and **admins** moderate the platform.

Built with **Next.js 16 (App Router) · Tailwind CSS v4 · shadcn/ui (Base UI) · plain JavaScript**.

> This build pairs a mocked, `localStorage`-backed store (users, applications, reviews) with real APIs: tuitions are served by the Express backend, auth by Better Auth + MongoDB, and **payments by Stripe** (recorded in the `payments` collection, see “Stripe payments” below). Every mock action is async and delayed so loading/pending states behave like a real API — swap `lib/store.jsx` for real fetches and nothing else changes.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

### Demo accounts (password: `123456`)

| Role    | Email                          | Can do                                              |
| ------- | ------------------------------ | --------------------------------------------------- |
| Student | `student@mentorlagbe.com`      | Browse, apply, save, review, upgrade to Pro         |
| Tutor   | `tutor@mentorlagbe.com`        | Post up to 2 (Free) / unlimited (Pro) tuitions, manage applicants |
| Admin   | `admin@mentorlagbe.com`        | Approve/reject listings, manage users & transactions |

Sign up creates a brand-new account with the `free` plan — pick your role on `/sign-up`.

## Features

**Public site**
- Home (`/`): hero with search, 6 latest approved tuitions, Free vs Pro pricing, 4-step workflow, subject categories + platform stats + testimonials, CTA band
- Browse (`/tuitions`): URL-driven search + subject/class-level/mode filters and pagination (shareable, server-read query params)
- Details (`/tuitions/[id]`): full listing, tutor summary, student reviews, **role-restricted apply flow** (students only, one application per tuition)
- Pricing (`/pricing`): Free vs Pro Tutor ($15) vs Pro Student ($10) with **real Stripe Checkout** (one-time payment — see “Stripe payments” below)
- Sign in / Sign Up with validation + toasts, `/payment/success`, `/payment/cancel`
- How It Works (`/about`), 404 + error boundaries, loading skeletons everywhere

**Dashboards** (collapsible sidebar, mobile sheet, top bar, profile menu)
- Student: overview stats, my applications (cancel while pending), saved tuitions
- Tutor: overview, post tuition (ImgBB/local image upload, Free = 2-post limit), full CRUD on my tuitions, applicant management (accept/reject)
- Admin: platform stats + revenue, user role management, tuition approval flow, Stripe transactions
- Shared: `/dashboard/profile` (name, phone, bio, avatar upload or URL, demo reset)

**Extras**: dark/light theme toggle (press <kbd>d</kbd>), bookmarks, server-style pagination, sonner toasts, seed data with 12 approved tuition listings.

## Stripe payments

Pro upgrades run through **real Stripe Checkout** (one-time payment, dynamic
`price_data` — no Products need to exist in the dashboard first):

```
SubscribeButton → POST /api/checkout  →  Stripe-hosted checkout
                                        ├─ success → /payment/success
                                        │            GET /api/checkout/verify
                                        └─ cancel  → /payment/cancel
POST /api/webhooks/stripe  ──►  payments collection (MongoDB)
                                user.plan = "pro"
```

| Route                         | What it does                                                        |
| ----------------------------- | ------------------------------------------------------------------- |
| `POST /api/checkout`          | Creates the Checkout Session from `PLANS` (auth + audience checked) |
| `POST /api/webhooks/stripe`   | Signature-verified webhook → records payment, upgrades the user      |
| `GET /api/checkout/verify`    | Reads the session from Stripe for the receipt; also finalises if the webhook is late |
| `GET /api/payments`           | Admin-only list of recorded payments                                 |

**Setup**

1. `.env` already holds `STRIPE_SECRET_KEY` (+ the publishable key).
2. Add `STRIPE_WEBHOOK_SECRET` — locally:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Paste the printed `whsec_…` into `.env`. In production, create an endpoint
   for `/api/webhooks/stripe` (event: `checkout.session.completed`) in the
   Stripe dashboard and copy its signing secret.
3. Restart `npm run dev`. Test cards: `4242 4242 4242 4242`, any future date,
   any CVC.

Both the webhook and the success-page verifier upsert on `stripeSessionId`, so
whichever arrives first writes the payment — duplicates are harmless.

## Project structure

```
app/
  (public)/            # navbar + footer shell → home, tuitions, pricing, about, auth, payment
  dashboard/           # role-based dashboards (layout = guard + sidebar + topbar)
  not-found.jsx        # 404   ·  error.jsx (error boundary)
components/
  site/                # navbar, footer, logo, theme toggle, X/social icons
  home/, tuitions/, pricing/, dashboard/, shared/
components/ui/         # shadcn/ui (Base UI) kit
lib/
  store.jsx            # mock database (4 collections) + all actions
  auth-context.jsx     # useAuth / useRequireAuth / dashboardHome
  data/seed.js         # realistic seed data
  constants.js         # subjects, class levels, plans, nav links
  upload.js            # ImgBB API upload with local fallback
docs/CONVENTIONS.md    # design system + data-layer contract
```

## Notes

- Next.js 16 conventions are used throughout: awaited `params`/`searchParams`, `error.jsx` with `{ error, retry }`, `proxy` instead of `middleware`.
- shadcn components are Base UI based → composition uses the `render` prop (not `asChild`).
- Tuition fees are shown in BDT (৳); Stripe plans are billed in USD ($).
