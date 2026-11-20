"use client"

/* Three plan cards for /pricing — needs the signed-in user's plan so the
   SubscribeButton can show "Current plan" / validate the audience. */

import PlanCard from "@/components/shared/plan-card"
import { useAuth } from "@/lib/auth-context"
import { PLANS } from "@/lib/constants"

export function PricingPlans() {
  const { user } = useAuth()

  return (
    <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
      <PlanCard plan={PLANS.free} audience="Tutor" currentPlan={user?.plan} />
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
  )
}

export default PricingPlans
