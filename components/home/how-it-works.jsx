import Link from "next/link"
import {
  ArrowRight,
  ClipboardCheck,
  Handshake,
  Search,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    text: "Sign up as a Student or Tutor in under a minute. Every account starts on the Free plan.",
  },
  {
    icon: Search,
    title: "Post or discover",
    text: "Tutors publish tuition batches from their dashboard while students browse approved listings.",
  },
  {
    icon: ClipboardCheck,
    title: "Admin approval",
    text: "Every listing is reviewed by our admin team so only real, complete tuitions go public.",
  },
  {
    icon: Handshake,
    title: "Apply & connect",
    text: "Students apply with their schedule and note — tutors accept or reject right in the dashboard.",
  },
]

export function HowItWorks() {
  return (
    <section className="section border-y border-border bg-muted/40">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">How MentorLagbe works</p>
          <h2 className="section-title mt-3">
            Four steps from search to success
          </h2>
          <p className="section-lead mx-auto">
            The same simple flow whether you are looking for a tutor or looking
            for students.
          </p>
        </div>

        <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <span
            className="absolute top-9 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 lg:block dark:from-indigo-800 dark:via-violet-800 dark:to-fuchsia-800"
            aria-hidden
          />
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="card-hover relative rounded-2xl border border-border bg-card p-6"
              >
                <span className="absolute -top-3 right-5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  Step {index + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 font-heading text-base font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            )
          })}
        </ol>

        <div className="mt-10 text-center">
          <Button size="lg" render={<Link href="/about" />}>
            See the full guide <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
