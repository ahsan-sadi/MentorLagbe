"use client"

/* Starts a real Stripe Checkout Session via POST /api/checkout and hands the
   browser over to Stripe-hosted payment. Card details never touch this app —
   the plan upgrade happens in the webhook / success-page verifier. */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function SubscribeButton({ plan, className, size = "default" }) {
  const router = useRouter()
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
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.url) {
        toast.error(data?.error || "Could not start checkout — try again.")
        setBusy(false)
        return
      }
      /* Full page navigation: Stripe owns the next screen. */
      window.location.href = data.url
    } catch {
      toast.error("Could not reach the payment server — try again.")
      setBusy(false)
    }
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
