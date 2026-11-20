"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import EmptyState from "@/components/shared/empty-state"
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import { useRequireAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { useTutions } from "@/hooks/use-tutions"
import { updateTutions } from "@/lib/actions/tutions"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

/* ------------------------------ panel shell ------------------------------ */

function Panel({ title, subtitle, action, children }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}

/* --------------------------------- page ---------------------------------- */

export default function AdminOverviewPage() {
  const { ready } = useRequireAuth(["admin"])
  const { users, payments } = useStore()
  const { tuitions, hydrated, refetch } = useTutions()
  const [busyId, setBusyId] = useState(null)

  const studentCount = users.filter((u) => u.role === "student").length
  const tutorCount = users.filter((u) => u.role === "tutor").length
  const proTutorCount = users.filter(
    (u) => u.role === "tutor" && u.plan === "pro"
  ).length

  const pendingTuitions = tuitions.filter((t) => t.approvalStatus === "pending")
  const approvedCount = tuitions.filter(
    (t) => t.approvalStatus === "approved"
  ).length
  const revenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
    .slice(0, 5)

  const decide = async (tuition, status) => {
    setBusyId(tuition._id)
    const result = await updateTutions(tuition._id, {
      approvalStatus: status,
    })
    setBusyId(null)
    if (!result.ok) return toast.error(result.error)
    refetch()
    toast.success(
      status === "approved"
        ? `"${tuition.title}" approved`
        : `"${tuition.title}" rejected`
    )
  }

  if (!ready || !hydrated) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting to the admin dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Keep an eye on users, tuition approvals and Stripe revenue across MentorLagbe — everything below updates live from the store."
        actions={
          <Button render={<Link href="/dashboard/admin/tuitions" />}>
            <ShieldCheck className="size-4" /> Review tuitions
          </Button>
        }
      />

      {/* ------------------------------ stats ------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={users.length}
          sublabel={`${studentCount} students · ${tutorCount} tutors`}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Total Tutors"
          value={tutorCount}
          sublabel={`${proTutorCount} on the Pro plan`}
          icon={GraduationCap}
          tone="violet"
        />
        <StatCard
          label="Pending vs Approved Tuitions"
          value={`${pendingTuitions.length} / ${approvedCount}`}
          sublabel="pending vs approved listings"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Total Stripe Revenue"
          value={`$${revenue}`}
          sublabel={`${payments.length} successful payments`}
          icon={CreditCard}
          tone="emerald"
        />
      </div>

      {/* ---------------------------- two panels --------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Pending approvals"
          subtitle={
            pendingTuitions.length
              ? `${pendingTuitions.length} tuition ${
                  pendingTuitions.length === 1 ? "is" : "are"
                } waiting for review`
              : "Nothing is waiting for review"
          }
          action={
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              render={<Link href="/dashboard/admin/tuitions" />}
            >
              Review all <ArrowRight className="size-4" />
            </Button>
          }
        >
          {pendingTuitions.length === 0 ? (
            <div className="flex-1 p-5">
              <EmptyState
                icon={CheckCircle2}
                title="No pending approvals"
                description="Every tuition posted by tutors has been reviewed. New submissions will show up here."
              />
            </div>
          ) : (
            pendingTuitions.map((tuition) => (
              <div
                key={tuition._id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/tuitions/${tuition._id}`}
                    className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    {tuition.title}
                  </Link>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {tuition.tutorName} ·{" "}
                    <span className="font-semibold text-foreground">
                      ৳{Number(tuition.monthlyFee).toLocaleString()}
                    </span>
                    /month · {fmtDate(tuition.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === tuition._id}
                    onClick={() => decide(tuition, "approved")}
                  >
                    {busyId === tuition._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={busyId === tuition._id}
                    onClick={() => decide(tuition, "rejected")}
                  >
                    <XCircle className="size-4" /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </Panel>

        <Panel
          title="Recent transactions"
          subtitle="Latest Stripe payments from Pro upgrades"
          action={
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              render={<Link href="/dashboard/admin/transactions" />}
            >
              View all <ArrowRight className="size-4" />
            </Button>
          }
        >
          {recentPayments.length === 0 ? (
            <div className="flex-1 p-5">
              <EmptyState
                icon={CreditCard}
                title="No transactions yet"
                description="Payments will appear here as soon as tutors and students upgrade to a Pro plan."
              />
            </div>
          ) : (
            <div className="flex-1 divide-y divide-border">
              {recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {payment.planName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {payment.userName} · {fmtDate(payment.paidAt)}
                    </p>
                  </div>
                  <span className="shrink-0 font-heading text-sm font-extrabold tracking-tight text-emerald-600 dark:text-emerald-300">
                    ${Number(payment.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
