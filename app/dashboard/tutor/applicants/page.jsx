"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  CheckCircle2,
  ClipboardList,
  Mail,
  Phone,
  Search,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import EmptyState from "@/components/shared/empty-state"
import PageHeader from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/role-badge"
import { useRequireAuth } from "@/lib/auth-context"
import { useTutions } from "@/hooks/use-tutions"
import { useApplications } from "@/hooks/use-applications"
import { setApplicationStatus } from "@/lib/actions/applications"
import { cn } from "@/lib/utils"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
]

/* Applicants across every tuition owned by the signed-in tutor, with a
   status filter, a name/title search and accept / reject actions. */
export default function ApplicantsPage() {
  const { user, ready } = useRequireAuth(["tutor"])
  const { applications, hydrated: applicationsHydrated, refetch } =
    useApplications()
  /* Own listings, every status — an applicant's tuition may still be pending. */
  const { tuitions, hydrated } = useTutions({ scope: "mine" })

  const [status, setStatus] = useState("all")
  const [query, setQuery] = useState("")
  const [busyId, setBusyId] = useState(null)

  const mine = useMemo(
    () => tuitions.filter((t) => t.tutorEmail === user?.email),
    [tuitions, user]
  )

  const rows = useMemo(() => {
    const mineIds = new Set(mine.map((t) => t._id))
    const q = query.trim().toLowerCase()
    return applications
      .filter((a) => mineIds.has(a.tuitionId))
      .filter((a) => status === "all" || a.status === status)
      .filter(
        (a) =>
          !q ||
          a.studentName.toLowerCase().includes(q) ||
          a.tuitionTitle.toLowerCase().includes(q) ||
          a.studentEmail.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
  }, [applications, mine, status, query])

  if (!ready || !user || !hydrated || !applicationsHydrated) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  const allMine = applications.filter((a) =>
    mine.some((t) => t._id === a.tuitionId)
  )
  const counts = {
    total: allMine.length,
    pending: allMine.filter((a) => a.status === "pending").length,
    accepted: allMine.filter((a) => a.status === "accepted").length,
    rejected: allMine.filter((a) => a.status === "rejected").length,
  }

  const respond = async (application, nextStatus) => {
    setBusyId(application._id)
    const result = await setApplicationStatus(application._id, nextStatus)
    setBusyId(null)
    if (!result.ok) return toast.error(result.error)
    refetch()
    toast.success(
      nextStatus === "accepted"
        ? `Application from ${application.studentName} accepted`
        : `Application from ${application.studentName} rejected`
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tutor dashboard"
        title="Applicants"
        description="Students who applied to your tuitions. Accept the ones you want to interview."
      />

      {/* ----------------------------- chips ----------------------------- */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { label: "Total", count: counts.total, className: "" },
          {
            label: "Pending",
            count: counts.pending,
            className: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Accepted",
            count: counts.accepted,
            className: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Rejected",
            count: counts.rejected,
            className: "text-muted-foreground",
          },
        ].map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground"
          >
            <span className={`font-heading font-extrabold ${chip.className}`}>
              {chip.count}
            </span>
            {chip.label}
          </span>
        ))}
      </div>

      {/* --------------------------- controls ---------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                status === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student or tuition…"
            className="pl-9"
          />
        </div>
      </div>

      {/* ----------------------------- table ----------------------------- */}
      {allMine.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applicants yet"
          description="When students apply to your tuitions, their applications will show up here."
          actionLabel="View my tuitions"
          actionHref="/dashboard/tutor/my-tuitions"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching applicants"
          description="Try a different search term or switch the status filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[880px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Student</TableHead>
                <TableHead className="px-4">Tuition</TableHead>
                <TableHead className="px-4">Preferred schedule</TableHead>
                <TableHead className="px-4">Applied</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((application) => (
                <TableRow key={application._id}>
                  <TableCell className="px-4 py-3">
                    <p className="truncate font-medium text-foreground">
                      {application.studentName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="size-3" /> {application.studentEmail}
                    </p>
                    {application.studentPhone && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="size-3" /> {application.studentPhone}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/tuitions/${application.tuitionId}`}
                      className="block max-w-56 truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                      title={application.tuitionTitle}
                    >
                      {application.tuitionTitle}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {application.subject} · ৳
                      {Number(application.monthlyFee).toLocaleString()}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {application.preferredSchedule || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {fmtDate(application.appliedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusBadge status={application.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {application.status === "pending" ? (
                        <>
                          <Button
                            size="xs"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            disabled={busyId === application._id}
                            onClick={() => respond(application, "accepted")}
                          >
                            <CheckCircle2 className="size-3" /> Accept
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={busyId === application._id}
                            onClick={() => respond(application, "rejected")}
                          >
                            <XCircle className="size-3" /> Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
