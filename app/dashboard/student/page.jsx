"use client"

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import EmptyState from "@/components/shared/empty-state"
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import TuitionCard from "@/components/shared/tuition-card"
import { StatusBadge } from "@/components/shared/role-badge"
import { useRequireAuth } from "@/lib/auth-context"
import { useApplications } from "@/hooks/use-applications"
import { useTutions } from "@/hooks/use-tutions"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export default function StudentOverviewPage() {
  const { user, ready } = useRequireAuth(["student"])
  const { applications, hydrated: applicationsHydrated } = useApplications()
  const { tuitions, hydrated } = useTutions()

  if (!ready || !user || !hydrated || !applicationsHydrated) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  const myApplications = applications.filter(
    (a) => a.studentEmail === user.email
  )
  const accepted = myApplications.filter((a) => a.status === "accepted").length
  const pending = myApplications.filter((a) => a.status === "pending").length

  const recent = [...myApplications]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5)

  const recommended = tuitions
    .filter((t) => t.approvalStatus === "approved" && t.isActive)
    .slice(0, 3)

  const isPro = user.plan === "pro"
  const firstName = user.name.split(" ")[0]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back, ${firstName}`}
        description="Track the tuitions you applied for, keep an eye on tutor responses and discover new batches curated for you."
        actions={
          <Button render={<Link href="/tuitions" />}>
            <ClipboardList className="size-4" /> Browse tuitions
          </Button>
        }
      />

      {/* ------------------------------ stats ------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applied Tuitions"
          value={myApplications.length}
          sublabel="across every subject"
          icon={ClipboardList}
          tone="primary"
        />
        <StatCard
          label="Accepted Applications"
          value={accepted}
          sublabel="tuitions you can start"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Pending Applications"
          value={pending}
          sublabel="awaiting tutor response"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Current Plan"
          value={isPro ? "Pro" : "Free"}
          sublabel={isPro ? "Priority booking unlocked" : "Upgrade any time"}
          icon={Sparkles}
          tone={isPro ? "violet" : "sky"}
        />
      </div>

      {/* --------------------- recent applications ------------------------ */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              Recent applications
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your {myApplications.length} most recent tuition applications
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            render={<Link href="/dashboard/student/my-applications" />}
          >
            View all <ArrowRight className="size-4" />
          </Button>
        </div>

        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={ClipboardList}
              title="No applications yet"
              description="When you apply for a tuition it will show up here with its live status."
              actionLabel="Browse tuitions"
              actionHref="/tuitions"
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((application) => (
              <div
                key={application._id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/tuitions/${application.tuitionId}`}
                    className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    title={application.tuitionTitle}
                  >
                    {application.tuitionTitle}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {application.subject} · ৳
                    {Number(application.monthlyFee).toLocaleString()}/month ·{" "}
                    {fmtDate(application.appliedAt)}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------- recommended --------------------------- */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              Recommended tuitions
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Freshly approved listings open for applications right now
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            render={<Link href="/tuitions" />}
          >
            Browse all <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="mt-4">
          {recommended.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nothing to recommend yet"
              description="New tuitions appear here as soon as the admin team approves them."
              actionLabel="Browse tuitions"
              actionHref="/tuitions"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((tuition) => (
                <TuitionCard key={tuition._id} tuition={tuition} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
