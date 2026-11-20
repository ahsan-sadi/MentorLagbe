"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
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
import { useStore } from "@/lib/store"
import { useTutions } from "@/hooks/use-tutions"
import { cn } from "@/lib/utils"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

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

export default function MyApplicationsPage() {
  const { user, ready } = useRequireAuth(["student"])
  const { applications, actions } = useStore()
  const { tuitions, hydrated } = useTutions()
  const [target, setTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const mine = useMemo(
    () =>
      applications
        .filter((a) => a.studentEmail === user?.email)
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)),
    [applications, user]
  )

  const counts = useMemo(
    () => ({
      total: mine.length,
      pending: mine.filter((a) => a.status === "pending").length,
      accepted: mine.filter((a) => a.status === "accepted").length,
      rejected: mine.filter((a) => a.status === "rejected").length,
    }),
    [mine]
  )

  const tutorNameOf = (application) =>
    tuitions.find((t) => t._id === application.tuitionId)?.tutorName ||
    application.tutorEmail

  const handleCancel = async () => {
    if (!target) return
    setCancelling(true)
    const result = await actions.cancelApplication(target._id)
    setCancelling(false)
    setTarget(null)
    if (!result.ok) return toast.error(result.error)
    toast.success("Application cancelled")
  }

  if (!ready || !user || !hydrated) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title="My applications"
        description="Every tuition you have applied for, in one place. Pending applications can be cancelled any time before the tutor decides."
        actions={
          <Button variant="outline" render={<Link href="/tuitions" />}>
            Browse more tuitions
          </Button>
        }
      />

      {/* --------------------------- stats strip --------------------------- */}
      <div className="flex flex-wrap gap-2.5">
        <StatChip icon={ClipboardList} count={counts.total} label="Total" />
        <StatChip icon={Clock3} count={counts.pending} label="Pending" />
        <StatChip
          icon={CheckCircle2}
          count={counts.accepted}
          label="Accepted"
        />
        <StatChip icon={XCircle} count={counts.rejected} label="Rejected" />
      </div>

      {/* ------------------------------ table ------------------------------ */}
      {mine.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="You haven't applied for any tuition yet"
          description="Browse approved tuitions and send your first application — tutors usually reply within 24 hours."
          actionLabel="Browse tuitions"
          actionHref="/tuitions"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Tuition</TableHead>
                <TableHead className="px-4">Tutor</TableHead>
                <TableHead className="px-4">Monthly fee</TableHead>
                <TableHead className="px-4">Applied</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mine.map((application) => (
                <TableRow key={application._id}>
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/tuitions/${application.tuitionId}`}
                      className="block max-w-72 truncate font-medium text-foreground transition-colors hover:text-primary"
                      title={application.tuitionTitle}
                    >
                      {application.tuitionTitle}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {application.subject}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="truncate font-medium text-foreground">
                      {tutorNameOf(application)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {application.tutorEmail}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-foreground">
                    ৳{Number(application.monthlyFee).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {fmtDate(application.appliedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusBadge status={application.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-end">
                      {application.status === "pending" ? (
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setTarget(application)}
                        >
                          <XCircle className="size-3.5" /> Cancel
                        </Button>
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

      {/* --------------------------- cancel dialog -------------------------- */}
      <AlertDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open && !cancelling) setTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {target
                ? `Your application for "${target.tuitionTitle}" will be withdrawn. You can always apply again later if the tuition is still open.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep application
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Cancelling…
                </>
              ) : (
                <>
                  <XCircle className="size-4" /> Cancel application
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
