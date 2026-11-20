# MentorLagbe — Frontend Conventions (read before writing any code)

> This is a **frontend-only** Next.js 16 (App Router) project written in **plain JavaScript**.
> Data is mocked in the browser (localStorage-backed store) — there is no backend.
> Keep every file **.js / .jsx** (no TypeScript).

## 1. Stack facts (Next.js 16 — differences from older Next)

- `params` / `searchParams` in **server** pages are **Promises** → `const { id } = await params`.
- In **client** pages use `useParams()` / `useSearchParams()` from `next/navigation`.
- `error.jsx` exports a client component receiving **`{ error, retry }`** (NOT `reset`).
- `loading.jsx`, `not-found.jsx` work as usual. Error boundaries must be client components.
- Turbopack is the default bundler. `next build` does NOT run lint.
- shadcn components are built on **Base UI**, not Radix:
  - Composing a link/button: use the **`render` prop**, never `asChild`:
    `<Button render={<Link href="/tuitions" />}>Browse</Button>`
  - Menu items use **`onClick`**, not `onSelect`.
  - `Sheet`/`Dialog` need `SheetTitle`/`DialogTitle` for a11y.
- `npm run build` must always pass before you finish.

## 2. Design system (Modern SaaS · indigo/violet)

Brand: indigo→violet gradient, Geist Sans body, **Plus Jakarta Sans headings** (`font-heading`).

Global helpers already defined in `app/globals.css` — use them instead of ad-hoc padding:

| Class | Purpose |
|---|---|
| `container-page` | max-w-7xl horizontal container (all sections/headers) |
| `section` | vertical section padding (py-16 md:py-24) |
| `section-title` | h2 style: `text-3xl sm:text-4xl font-extrabold tracking-tight` |
| `section-lead` | muted paragraph under a section title |
| `eyebrow` | small pill label above titles (`<p className="eyebrow">…</p>`) |
| `text-gradient` | indigo→fuchsia gradient text (use sparingly, e.g. one phrase per heading) |
| `card-hover` | lift + shadow on hover (cards) |

Rules:
- All headings use `font-heading` + `font-extrabold tracking-tight`.
- Cards: `rounded-2xl border border-border bg-card`, equal height via `flex h-full flex-col`.
- Grids: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` (3-up), `gap-4 sm:grid-cols-2 xl:grid-cols-4` for stats.
- Buttons: always the shadcn `Button` (`variant="default" | "outline" | "ghost" | "secondary" | "destructive"`, `size="sm" | "default" | "lg" | "icon-sm"`). Primary = indigo. Don't invent new button styles.
- Images: uniform heights (`h-44` on cards, `aspect-[4/3]` hero). Use plain `<img>` for avatars (dicebear SVG), `next/image` optional for banners (host allow-list: images.unsplash.com, i.pravatar.cc, api.dicebear.com, i.ibb.cc, picsum.photos).
- Fully responsive: mobile-first, test `sm:` breakpoints, use `Sheet` for mobile menus.

## 3. UI kit (components/ui — already converted to JSX)

Available (import from `@/components/ui/<name>`):
`button, badge, card (Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter), input, label, textarea, select (Select/SelectTrigger/SelectValue/SelectContent/SelectItem), dialog, alert-dialog, sheet, dropdown-menu, tabs, table (Table/TableHeader/TableBody/TableHead/TableRow/TableCell), skeleton, separator, switch, checkbox, radio-group, avatar, tooltip, popover, accordion, empty (Empty/EmptyHeader/EmptyMedia/EmptyTitle/EmptyDescription/EmptyContent), alert, spinner, pagination, kbd, switch, scroll-area`

Shared project components:
- `@/components/shared/tuition-card` → `<TuitionCard tuition={t} showStatus />` (equal-height listing card)
- `@/components/shared/page-header` → `<PageHeader eyebrow title description actions />`
- `@/components/shared/stat-card` → `<StatCard label value sublabel icon={Icon} tone="primary|violet|emerald|amber|rose|sky" />`
- `@/components/shared/role-badge` → `<RoleBadge role plan />`, `<StatusBadge status label />`
- `@/components/shared/empty-state` → `<EmptyState icon title description actionLabel actionHref />`
- `@/components/shared/skeletons` → `TuitionCardSkeleton, TuitionGridSkeleton, StatCardSkeleton, StatsGridSkeleton, TableSkeleton, PageSkeleton`
- `@/components/shared/image-upload` → `<ImageUpload label value onChange maxSize rounded hint />` (ImgBB/local upload, Challenge 3)
- `@/components/shared/plan-card` → `<PlanCard plan audience currentPlan highlighted />`
- `@/components/site/navbar`, `@/components/site/footer`, `@/components/site/logo`, `@/components/site/theme-toggle`

## 4. Data layer (the "database")

```js
import { useStore } from "@/lib/store"     // client hook
import { useAuth, useRequireAuth, dashboardHome } from "@/lib/auth-context"
```

`useStore()` returns:
```js
{
  users, tuitions, applications, payments, reviews, bookmarks, session, hydrated,
  currentUser,          // signed-in user object or null
  actions: { ... }      // ALL async — always `await` them, they resolve in ~300ms
}
```

State shapes (mirrors the 4 collections):
```js
user:      { _id, name, email, password, image, role: 'student'|'tutor'|'admin', phone, bio, plan: 'free'|'pro', createdAt }
tuition:   { _id, title, subject, classLevel, mode:'Online'|'Offline', location, monthlyFee, daysPerWeek, schedule, bannerImage, description, tutorName, tutorEmail, tutorPlan, approvalStatus:'pending'|'approved'|'rejected', isActive, createdAt }
application:{ _id, tuitionId, tuitionTitle, subject, monthlyFee, tutorEmail, studentName, studentEmail, studentPhone, preferredSchedule, studentNote, status:'pending'|'accepted'|'rejected', appliedAt }
payment:   { _id, userEmail, userName, userRole, planName, amount, currency, transactionId, stripeSessionId, paymentStatus:'paid', paidAt }
review:    { _id, tuitionId, studentName, rating, comment, createdAt }
```

Actions (signatures):
```js
await actions.signUp({ name, email, password, role })        // → { ok, user? , error? }
await actions.signIn({ email, password })                    // → { ok, user?, error? }
await actions.signOut()
await actions.updateProfile({ name, phone, bio, image, email })
await actions.createTuition(data)   // → { ok, tuition?, error? } (free tutors max 2)
await actions.updateTuition(id, patch) | deleteTuition(id) | toggleTuitionActive(id)
await actions.setTuitionApproval(id, 'approved'|'rejected')   // admin
await actions.applyToTuition(tuitionId, { studentPhone, preferredSchedule, studentNote }) // role-checked, duplicate-checked
await actions.setApplicationStatus(id, 'accepted'|'rejected') // tutor
await actions.cancelApplication(id)                           // student, pending only
await actions.toggleBookmark(tuitionId)
await actions.checkout(plan)          // plan = PLANS.proTutor | PLANS.proStudent → creates payment + sets plan 'pro'
await actions.setUserRole(id, role)   // admin
await actions.addReview({ tuitionId, rating, comment })
await actions.resetDemo()             // resets localStorage back to seed
```

Every action returns `{ ok: boolean, error?: string }`. On failure show `toast.error(result.error)`,
on success `toast.success("…")` — **use `sonner`** (`import { toast } from "sonner"`). The root
layout already renders `<Toaster richColors position="top-right" closeButton />`.

Auth helpers:
```js
const { user, isAuthenticated, role, signIn, signOut } = useAuth()
const { user, ready } = useRequireAuth(["tutor"])  // guards + redirects, use in dashboards
dashboardHome(role) // '/dashboard/student' | '/dashboard/tutor' | '/dashboard/admin'
```

Demo accounts (show these on sign-in page): `student@/tutor@/admin@mentorlagbe.com` + password `123456`.

Constants (`@/lib/constants`): `NAV_LINKS, SUBJECTS, CLASS_LEVELS, MODES, DAYS_PER_WEEK,
ROLES, ROLE_LABELS, PLANS (free/proTutor/proStudent), FREE_TUTOR_POST_LIMIT, STATUS_STYLES,
DEMO_ACCOUNTS`.
Seed data (`@/lib/data/seed`): `seedUsers, seedTuitions (14), seedApplications, seedPayments,
seedReviews, testimonials, platformStats, subjectHighlights`.

Image upload: `import { uploadImage } from "@/lib/upload"` → `uploadImage(file, { maxSize })`
returns `{ ok, url, simulated? , error? }`. Use `<ImageUpload>` component instead of calling directly.

## 5. Page conventions

- Public pages live in **`app/(public)/`** (they automatically get Navbar + Footer via the layout).
- Dashboard pages live in **`app/dashboard/`** (sidebar shell layout).
- Every route that fetches/derives data gets a `loading.jsx` using the shared skeletons.
- Forms: controlled `useState`, validate before submit, `pending` state on the button
  (`disabled={pending}` + spinner), toast on success/error, reset on success.
- Money: tuition fees are **BDT (`৳` + `.toLocaleString()`)**; Stripe plans are **USD `$`**.
- Dates: `new Date(x).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })`.
- Never add TypeScript. Never touch `components/ui/*` unless it's a bug fix.
- Metadata: export `export const metadata = { title: "…" }` from **server** pages only
  (client pages can't export metadata — skip it there).

## 6. File ownership (do not create/modify files outside your assignment)

See the task prompt you were given. Shared files (store, constants, ui kit, navbar, layout) are frozen.
