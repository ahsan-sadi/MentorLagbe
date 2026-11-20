"use client"

/* Post-checkout confirmation — matches the Stripe session id from the query
   string against the payment record in the store, then shows the receipt. */

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  CircleAlert,
  CircleCheckBig,
  LayoutDashboard,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAuth, dashboardHome } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { PLANS, STATUS_STYLES } from "@/lib/constants"

const money = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount) || 0
  )

const formatDate = (iso) => {
  const date = new Date(iso)
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${day} · ${time}`
}

/* ------------------------- verifying skeleton ------------------------- */

function VerifyingReceipt() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-primary" />
            <p className="text-sm font-medium">
              Verifying your payment with Stripe…
            </p>
          </div>
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Skeleton className="h-10 w-full rounded-lg sm:w-44" />
          <Skeleton className="h-10 w-full rounded-lg sm:w-44" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ content ------------------------------- */

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const planParam = searchParams.get("plan")

  const { payments } = useStore()
  const { user, isAuthenticated } = useAuth()

  const [verifying, setVerifying] = useState(true)
  const toastedRef = useRef(false)

  /* simulate the Stripe webhook round-trip before showing the receipt */
  useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const payment = useMemo(
    () =>
      sessionId
        ? payments.find((p) => p.stripeSessionId === sessionId) || null
        : null,
    [payments, sessionId]
  )

  /* fire exactly once, even under StrictMode double-effects */
  useEffect(() => {
    if (verifying || toastedRef.current) return
    toastedRef.current = true
    if (payment) {
      toast.success(`Payment confirmed — ${payment.planName} is active!`)
    } else if (sessionId) {
      toast.error("We could not locate this payment session.")
    }
  }, [verifying, payment, sessionId])

  if (verifying) return <VerifyingReceipt />

  /* graceful fallback when no payment record matches the session */
  const fallbackPlan = Object.values(PLANS).find((p) => p.name === planParam)

  const receipt = [
    { label: "Plan", value: payment?.planName || planParam || "Pro plan" },
    {
      label: "Amount",
      value: payment
        ? `${money(payment.amount, payment.currency)} ${payment.currency}`
        : fallbackPlan
          ? `${money(fallbackPlan.price)} USD`
          : "—",
    },
    { label: "Transaction ID", value: payment?.transactionId || "—" },
    {
      label: "Stripe session",
      value: payment?.stripeSessionId || sessionId || "—",
      mono: true,
    },
    { label: "Date", value: payment ? formatDate(payment.paidAt) : "—" },
    { label: "Status", status: payment ? "paid" : "pending" },
  ]

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto w-full max-w-lg text-center">
        {/* success mark */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
          <CircleCheckBig className="size-8" strokeWidth={2.5} />
        </div>

        <p className="eyebrow mt-6">Payment successful</p>
        <h1 className="section-title mt-3">
          You are on <span className="text-gradient">Pro</span> now
        </h1>
        <p className="section-lead mx-auto">
          Thanks — your payment went through and every Pro benefit is already
          unlocked on your account, starting with your next page load.
        </p>

        {!payment && (
          <p className="mx-auto mt-6 flex w-fit items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs leading-relaxed text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              We could not match this session to a payment record — no charge
              was made. If you just completed checkout, your plan will update
              within a minute.
            </span>
          </p>
        )}

        {/* ----------------------------- receipt --------------------------- */}
        <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card px-5 text-left">
          {receipt.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4 py-3.5"
            >
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  "text-right text-sm font-medium text-foreground",
                  row.mono && "font-mono text-xs break-all"
                )}
              >
                {row.status ? (
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      STATUS_STYLES[row.status]
                    )}
                  >
                    {row.status === "paid" ? "Paid" : "Verifying"}
                  </span>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* ----------------------------- actions --------------------------- */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isAuthenticated ? (
            <Button
              size="lg"
              render={<Link href={dashboardHome(user?.role)} />}
            >
              <LayoutDashboard className="size-4" /> Go to dashboard
            </Button>
          ) : (
            <Button size="lg" render={<Link href="/sign-in" />}>
              <LogIn className="size-4" /> Sign in to view your dashboard
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/tuitions" />}
          >
            Browse tuitions
          </Button>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          Secured by Stripe — no card details are ever stored on MentorLagbe
        </p>
      </div>
    </div>
  )
}

/* -------------------------------- page --------------------------------- */

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<VerifyingReceipt />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
