"use client"

/* Stripe checkout cancelled — the user was redirected back without paying. */

import Link from "next/link"
import { ArrowRight, CircleX, Home, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function PaymentCancelPage() {
  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto w-full max-w-lg text-center">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <CircleX className="size-8" />
          </span>

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Payment cancelled
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No worries — your checkout was cancelled and{" "}
            <strong>you have not been charged</strong>. Your current plan stays
            exactly the same.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Want to try again?</p>
            <p className="mt-1">
              Head back to the pricing page, pick your Pro plan and complete the
              Stripe checkout whenever you are ready. You can cancel anytime.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button render={<Link href="/pricing" />}>
              <RefreshCcw className="size-4" /> Back to Pricing
            </Button>
            <Button variant="outline" render={<Link href="/tuitions" />}>
              Browse Tuitions <ArrowRight className="size-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-muted-foreground"
            render={<Link href="/" />}
          >
            <Home className="size-4" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
