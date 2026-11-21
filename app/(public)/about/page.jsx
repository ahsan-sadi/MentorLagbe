import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  Handshake,
  ImageUp,
  LayoutDashboard,
  MonitorSmartphone,
  ScanSearch,
  Search,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { platformStats } from "@/lib/data/seed"

export const metadata = {
  title: "How It Works",
  description:
    "How MentorLagbe works — sign up, post or discover tuition batches, get admin approval, then apply and connect from one clean dashboard.",
}

/* ------------------------------- timeline -------------------------------- */

const steps = [
  {
    icon: UserPlus,
    title: "Sign up in under a minute",
    text: "Create a free account as a Student or Tutor — pick your role, add your email and password, and you land in a dashboard built for that role. Every account starts on the Free plan, no card required.",
    points: [
      "Student, Tutor or Admin roles",
      "Free plan forever, upgrade any time",
    ],
  },
  {
    icon: Search,
    title: "Post or discover tuitions",
    text: "Tutors publish a tuition batch from their dashboard — title, subject, class level, fee, schedule and a banner image. Students search the live listings by title, subject or tutor and filter by class level and mode.",
    points: [
      "Free tutors can keep up to 2 live posts",
      "URL-driven search, filters are shareable",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Admin approval",
    text: "Every new listing enters a pending queue. Our admin team reviews each submission for completeness and accuracy, then approves or rejects it — only real, approved batches ever go public.",
    points: [
      "Pending → Approved / Rejected status",
      "Students only see verified listings",
    ],
  },
  {
    icon: Handshake,
    title: "Apply & connect",
    text: "Students apply with their phone number, preferred schedule and a short note. Tutors review applicants in the dashboard and accept or reject — both sides track every application's status in real time.",
    points: [
      "One application per student per tuition",
      "Accept / reject decisions in the dashboard",
    ],
  },
]

/* ------------------------------ why us grid ------------------------------ */

const features = [
  {
    icon: BadgeCheck,
    title: "Verified listings",
    text: "Every tuition is reviewed by the admin team before it goes public, so students only ever see complete, real batches.",
  },
  {
    icon: LayoutDashboard,
    title: "Role-based dashboards",
    text: "Students, tutors and admins each get their own sidebar dashboard with the exact tools that role needs — nothing more.",
  },
  {
    icon: ScanSearch,
    title: "Server-side search",
    text: "Search and filters run through the server with shareable URLs, so results are fast, consistent and easy to link to.",
  },
  {
    icon: CreditCard,
    title: "Secure Stripe plans",
    text: "Upgrades run through Stripe's hosted checkout with clear pricing and instant activation — the plan flips to Pro the moment the payment lands.",
  },
  {
    icon: ImageUp,
    title: "ImgBB image uploads",
    text: "Tutors upload banner images and avatars straight to ImgBB with size checks — no external hosting setup needed.",
  },
  {
    icon: MonitorSmartphone,
    title: "Responsive design",
    text: "The whole marketplace is mobile-first: sheets for menus, stacked grids and touch-friendly controls on every screen.",
  },
]

/* --------------------------------- page ---------------------------------- */

export default function AboutPage() {
  return (
    <>
      {/* ---------------------------- page header --------------------------- */}
      <section className="section border-b border-border/60">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How MentorLagbe works</p>
            <h1 className="section-title mt-3">
              From sign-up to{" "}
              <span className="text-gradient">first connection</span> in four
              steps
            </h1>
            <p className="section-lead mx-auto">
              MentorLagbe is a full tutoring marketplace for Bangladesh —
              students find approved batches, tutors grow their classes, and
              admins keep everything spam-free. Here is exactly how the whole
              flow works.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------ timeline ---------------------------- */}
      <section className="section border-b border-border bg-muted/40">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The workflow</p>
            <h2 className="section-title mt-3">
              Four steps from search to success
            </h2>
            <p className="section-lead mx-auto">
              The same simple flow whether you are looking for a tutor or
              looking for students — expanded below so you know exactly what
              happens at each stage.
            </p>
          </div>

          <ol className="relative mx-auto mt-12 max-w-3xl space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <li key={step.title} className="relative flex gap-5">
                  <div className="flex flex-col items-center">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 font-heading text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25">
                      {index + 1}
                    </span>
                    {index < steps.length - 1 && (
                      <span
                        className="my-2 w-px flex-1 bg-gradient-to-b from-indigo-300 via-violet-300 to-fuchsia-300 dark:from-indigo-800 dark:via-violet-800 dark:to-fuchsia-800"
                        aria-hidden
                      />
                    )}
                  </div>

                  <div className="card-hover min-w-0 flex-1 rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                        <Icon className="size-5" />
                      </span>
                      <h3 className="font-heading text-lg font-bold tracking-tight">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                    <ul className="mt-4 space-y-2 border-t border-border pt-4">
                      {step.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <span className="size-1.5 rounded-full bg-current" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="mt-10 text-center">
            <Button size="lg" render={<Link href="/sign-up" />}>
              Create your free account <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------ why grid ---------------------------- */}
      <section className="section border-b border-border">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Why MentorLagbe</p>
            <h2 className="section-title mt-3">
              Built for real teaching &amp; learning
            </h2>
            <p className="section-lead mx-auto">
              Everything below is part of the product today — not a roadmap. Six
              reasons students and tutors keep coming back.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="card-hover flex h-full flex-col rounded-2xl border border-border bg-card p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------- stats ------------------------------ */}
      <section className="section border-b border-border bg-muted/40">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Platform statistics</p>
            <h2 className="section-title mt-3">Trusted across Bangladesh</h2>
            <p className="section-lead mx-auto">
              Real numbers from a growing community of verified tutors, students
              and mentorship batches.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {platformStats.map((stat) => (
              <div
                key={stat.label}
                className="card-hover rounded-2xl border border-border bg-card p-6 text-center"
              >
                <p className="text-gradient font-heading text-4xl font-extrabold tracking-tight">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- CTA ------------------------------- */}
      <section className="section">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-14 text-center shadow-2xl shadow-violet-500/25 sm:px-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to find your perfect match?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                Create a free account in under a minute, or browse the approved
                tuition batches that are live right now across Bangladesh.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-white/90"
                  render={<Link href="/sign-up" />}
                >
                  Sign up free <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  render={<Link href="/tuitions" />}
                >
                  Browse Tuitions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
