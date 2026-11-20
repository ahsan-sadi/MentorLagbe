import Link from "next/link"
import {
  Atom,
  ArrowRight,
  BookOpen,
  Calculator,
  Code2,
  FlaskConical,
  Languages,
  Quote,
  Star,
} from "lucide-react"

import { platformStats, subjectHighlights, testimonials } from "@/lib/data/seed"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const ICONS = {
  calculator: Calculator,
  atom: Atom,
  code: Code2,
  languages: Languages,
  flask: FlaskConical,
  book: BookOpen,
}

/* ------------------------ subjects + statistics ------------------- */

export function SubjectsStats() {
  return (
    <section className="section border-y border-border bg-muted/40">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Top subjects</p>
            <h2 className="section-title mt-3">
              Popular categories on MentorLagbe
            </h2>
            <p className="section-lead">
              From board exam basics to interview-level programming — these are
              the subjects students search for the most.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {subjectHighlights.map((subject) => {
                const Icon = ICONS[subject.icon] || BookOpen
                return (
                  <Link
                    key={subject.name}
                    href={`/tuitions?subject=${encodeURIComponent(subject.name)}`}
                    className="card-hover group flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {subject.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {subject.tutors} tutors available
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <p className="eyebrow">Platform statistics</p>
            <h2 className="section-title mt-3">Trusted across Bangladesh</h2>
            <p className="section-lead">
              Real numbers from a growing community of tutors and students.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {platformStats.map((stat) => (
                <Card key={stat.label} className="card-hover rounded-2xl">
                  <CardContent className="p-6">
                    <p className="text-gradient font-heading text-4xl font-extrabold tracking-tight">
                      {stat.value}
                      {stat.suffix}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------------- testimonials ---------------------- */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Testimonials</p>
            <h2 className="section-title mt-3">What our community says</h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((item) => (
              <Card
                key={item.name}
                className="card-hover flex h-full flex-col rounded-2xl"
              >
                <CardContent className="flex flex-1 flex-col p-6">
                  <Quote className="size-6 text-primary/60" />
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    “{item.quote}”
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <img
                      src={item.image}
                      alt=""
                      className="size-10 rounded-full border border-border bg-muted"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="size-3 fill-current" />
                      ))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- CTA band --------------------------- */

export function CtaBand() {
  return (
    <section className="section bg-background">
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
              Join thousands of students and tutors already learning, teaching
              and growing on MentorLagbe — it only takes a minute to get
              started.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-indigo-700 hover:bg-white/90"
                render={<Link href="/tuitions" />}
              >
                Browse Tuitions <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                render={<Link href="/sign-up" />}
              >
                Create free account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SubjectsStats
