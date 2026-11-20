"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import PlanCard from "@/components/shared/plan-card"
import { useAuth } from "@/lib/auth-context"
import { PLANS } from "@/lib/constants"

/* Home page pricing preview — Free vs Pro for Tutors and Students. */
export function PricingPreview() {
  const { user } = useAuth()

  return (
    <section className="section relative overflow-hidden bg-background">
      <div
        className="glow-dot pointer-events-none absolute top-0 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full opacity-60"
        aria-hidden
      />
      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Pricing</p>
          <h2 className="section-title mt-3">
            Start free. Upgrade when you are ready.
          </h2>
          <p className="section-lead mx-auto">
            Students can browse and apply for free forever. Tutors post their
            first two tuitions at no cost — go Pro for unlimited listings.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          <PlanCard
            plan={PLANS.free}
            audience="Tutor"
            currentPlan={user?.plan}
          />
          <PlanCard
            plan={PLANS.proTutor}
            audience="Tutor"
            currentPlan={user?.plan}
            highlighted
          />
          <PlanCard
            plan={PLANS.proStudent}
            audience="Student"
            currentPlan={user?.plan}
          />
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" render={<Link href="/pricing" />}>
            Compare all plan features <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

export default PricingPreview
