"use client"

/* Simulated Stripe Checkout — creates a payment record + upgrades the
   user to Pro, then redirects to the success page. */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"

export function SubscribeButton({
  plan,
  audience,
  className,
  size = "default",
}) {
  const router = useRouter()
  const { actions } = useStore()
  const { user, isAuthenticated } = useAuth()
  const [busy, setBusy] = useState(false)

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to upgrade your plan")
      router.push("/sign-in")
      return
    }
    if (plan.audience && user.role !== plan.audience) {
      toast.error(
        `This plan is for ${plan.audience}s — you are signed in as a ${user.role}.`
      )
      return
    }
    setBusy(true)
    const result = await actions.checkout(plan)
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success("Payment successful — welcome to Pro!")
    router.push(
      `/payment/success?session_id=${result.payment.stripeSessionId}&plan=${encodeURIComponent(plan.name)}`
    )
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={busy}
      className={className}
      size={size}
    >
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Redirecting to Stripe…
        </>
      ) : (
        <>
          <Zap className="size-4" /> Subscribe with Stripe
        </>
      )}
    </Button>
  )
}

export default SubscribeButton
