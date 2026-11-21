"use client"

import Link from "next/link"
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  PlusCircle,
  Sparkles,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import PageHeader from "@/components/shared/page-header"
import StatCard from "@/components/shared/stat-card"
import EmptyState from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/role-badge"
import { useRequireAuth } from "@/lib/auth-context"
import { useApplications } from "@/hooks/use-applications"
import { useTutions } from "@/hooks/use-tutions"
import { FREE_TUTOR_POST_LIMIT } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function TutorOverviewPage() {
  const { user, ready } = useRequireAuth(["tutor"])
  const { applications, hydrated: applicationsHydrated } = useApplications()
  const { tuitions, hydrated } = useTutions()

  if (!ready || !user || !hydrated || !applicationsHydrated) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  const mine = tuitions
    .filter((t) => t.tutorEmail === user.email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const applicants = applications.filter((a) =>
    mine.some((t) => t._id === a.tuitionId)
  )
  const approved = mine.filter((t) => t.approvalStatus === "approved").length
  const pending = mine.filter((t) => t.approvalStatus === "pending").length
  const isPro = user.plan === "pro"
  const slotsLeft = Math.max(0, FREE_TUTOR_POST_LIMIT - mine.length)
  const firstName = user.name.split(" ")[0]

  const recent = mine.slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tutor dashboard"
        title={`Welcome back, ${firstName}`}
        description="Manage your tuition listings, review incoming applications and keep track of your plan."
        actions={
          <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
            <PlusCircle className="size-4" /> Post a tuition
          </Button>
        }
      />

      {/* ----------------------------- stats ----------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tuitions Posted"
          value={mine.length}
          sublabel={`${pending} awaiting approval`}
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="Active / Approved"
          value={`${approved}/${mine.length}`}
          sublabel="Live on the browse page"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Total Applicants Received"
          value={applicants.length}
          sublabel={`${applicants.filter((a) => a.status === "pending").length} need a reply`}
          icon={ClipboardList}
          tone="violet"
        />
        <StatCard
          label="Current Plan"
          value={isPro ? "Pro" : "Free"}
          sublabel={
            isPro
              ? "Unlimited posts unlocked"
              : `Posts left: ${slotsLeft}/${FREE_TUTOR_POST_LIMIT}`
          }
          icon={isPro ? BadgeCheck : UserRound}
          tone={isPro ? "violet" : "amber"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ------------------------ recent listings ---------------------- */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Recent tuitions</h2>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/tutor/my-tuitions" />}
            >
              View all
            </Button>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={PlusCircle}
              title="You haven't posted a tuition yet"
              description="Create your first listing — it only takes a couple of minutes and goes live once the admin approves it."
              actionLabel="Post a tuition"
              actionHref="/dashboard/tutor/post-tuition"
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Fee</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Applicants</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((tuition) => (
                    <tr
                      key={tuition._id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/tuitions/${tuition._id}`}
                          className="line-clamp-1 font-medium text-foreground hover:text-primary"
                          title={tuition.title}
                        >
                          {tuition.title}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {tuition.subject} · {tuition.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ৳{Number(tuition.monthlyFee).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tuition.approvalStatus} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {
                          applicants.filter((a) => a.tuitionId === tuition._id)
                            .length
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --------------------------- plan card -------------------------- */}
        <Card className="h-fit rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Sparkles className="size-4.5 text-violet-500" /> Your plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "rounded-xl border p-4",
                isPro
                  ? "border-violet-200 bg-violet-50 dark:border-violet-500/25 dark:bg-violet-500/10"
                  : "border-border bg-muted/40"
              )}
            >
              <p className="font-heading text-xl font-extrabold">
                {isPro ? "Pro Tutor" : "Free Plan"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPro
                  ? "Unlimited posts, verified badge and priority placement are active."
                  : `You can post ${FREE_TUTOR_POST_LIMIT} tuitions — ${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} remaining.`}
              </p>
            </div>

            <Separator />

            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                "Unlimited tuition posts",
                "Verified Pro badge on listings",
                "Priority placement in search",
                "Full applicant contact details",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isPro ? "text-emerald-500" : "text-muted-foreground/50"
                    )}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <BadgeCheck className="size-4" /> Pro plan active — thank you!
              </p>
            ) : (
              <Button className="w-full" render={<Link href="/pricing" />}>
                Upgrade to Pro — $15/mo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
