"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CheckCircle2, Clock3, Loader2, Search, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { updateTutions } from "@/lib/actions/tutions"
import { useTutions } from "@/hooks/use-tutions"
import { cn } from "@/lib/utils"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

const APPROVAL_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

/* Label map so the trigger shows "Pending", not "pending". */
const APPROVAL_ITEMS = Object.fromEntries(
  APPROVAL_FILTERS.map((item) => [item.value, item.label])
)

const STATUS_RANK = { pending: 0, approved: 1, rejected: 2 }

function StatChip({ icon: Icon, count, label, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3.5" />
      <span className="font-heading font-extrabold text-foreground">
        {count}
      </span>
      {label}
    </span>
  )
}

export default function AdminTuitionsPage() {
  const { ready } = useRequireAuth(["admin"])
  const { tuitions, hydrated, refetch } = useTutions()
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [busyKey, setBusyKey] = useState(null)

  const counts = useMemo(
    () => ({
      pending: tuitions.filter((t) => t.approvalStatus === "pending").length,
      approved: tuitions.filter((t) => t.approvalStatus === "approved").length,
      rejected: tuitions.filter((t) => t.approvalStatus === "rejected").length,
    }),
    [tuitions]
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return tuitions
      .filter((t) => {
        const matchesSearch =
          !needle ||
          t.title.toLowerCase().includes(needle) ||
          t.tutorName.toLowerCase().includes(needle) ||
          t.tutorEmail.toLowerCase().includes(needle)
        const matchesStatus = !statusFilter || t.approvalStatus === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort(
        (a, b) =>
          STATUS_RANK[a.approvalStatus] - STATUS_RANK[b.approvalStatus] ||
          new Date(b.createdAt) - new Date(a.createdAt)
      )
  }, [tuitions, q, statusFilter])

  const decide = async (tuition, status) => {
    const key = `${tuition._id}:${status}`
    setBusyKey(key)
    const result = await updateTutions(tuition._id, {
      approvalStatus: status,
    })
    setBusyKey(null)
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
        title="Tuition approval"
        description="Review every tuition posted by tutors. Pending listings appear first — approve them to publish, or reject them with feedback to the tutor."
      />

      {/* ----------------------------- filters ----------------------------- */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search by title or tutor…"
              className="h-10 pl-10"
              aria-label="Search tuitions"
            />
          </div>

          <Select
            value={statusFilter || null}
            items={APPROVAL_ITEMS}
            onValueChange={(value) =>
              setStatusFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger
              className="w-full lg:w-48"
              aria-label="Filter by approval status"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {APPROVAL_FILTERS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            <StatChip icon={Clock3} count={counts.pending} label="Pending" />
            <StatChip
              icon={CheckCircle2}
              count={counts.approved}
              label="Approved"
            />
            <StatChip icon={XCircle} count={counts.rejected} label="Rejected" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "tuition" : "tuitions"} shown
          </p>
        </div>
      </div>

      {/* ------------------------------ table ------------------------------ */}
      {filtered.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={Search}
            title="No tuitions match those filters"
            description="Try a different search term or approval status — or clear the filters to see every tuition."
          />
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQ("")
                setStatusFilter("")
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[1080px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="px-4">Tutor</TableHead>
                <TableHead className="px-4">Subject / Class</TableHead>
                <TableHead className="px-4">Mode</TableHead>
                <TableHead className="px-4">Fee</TableHead>
                <TableHead className="px-4">Created</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tuition) => {
                const approving = busyKey === `${tuition._id}:approved`
                const rejecting = busyKey === `${tuition._id}:rejected`
                const busy = approving || rejecting
                return (
                  <TableRow key={tuition._id}>
                    <TableCell className="px-4 py-3">
                      <Link
                        href={`/tuitions/${tuition._id}`}
                        className="block max-w-64 truncate font-medium text-foreground transition-colors hover:text-primary"
                        title={tuition.title}
                      >
                        {tuition.title}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="truncate font-medium text-foreground">
                        {tuition.tutorName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {tuition.tutorEmail}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {tuition.subject} · {tuition.classLevel}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {tuition.mode}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-semibold text-foreground">
                      ৳{Number(tuition.monthlyFee).toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {fmtDate(tuition.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={tuition.approvalStatus} />
                        <StatusBadge
                          status={tuition.isActive ? "active" : "closed"}
                          label={tuition.isActive ? "Active" : "Closed"}
                        />
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={
                            busy || tuition.approvalStatus === "approved"
                          }
                          onClick={() => decide(tuition, "approved")}
                        >
                          {approving ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={
                            busy || tuition.approvalStatus === "rejected"
                          }
                          onClick={() => decide(tuition, "rejected")}
                        >
                          <XCircle className="size-3.5" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
