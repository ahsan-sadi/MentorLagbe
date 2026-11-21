"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { TuitionForm } from "@/components/dashboard/tuition-form"
import { useRequireAuth } from "@/lib/auth-context"
import { useApplications } from "@/hooks/use-applications"
import { useTutions } from "@/hooks/use-tutions"
import { updateTutions, deleteTutions } from "@/lib/actions/tutions"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

/* All listings by the signed-in tutor: edit (re-queues for approval),
   toggle active/inactive and delete. */
export default function MyTuitionsPage() {
  const { user, ready } = useRequireAuth(["tutor"])
  const { applications, hydrated: applicationsHydrated } = useApplications()
  const { tuitions, hydrated, refetch } = useTutions()

  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const mine = useMemo(
    () =>
      tuitions
        .filter((t) => t.tutorEmail === user?.email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [tuitions, user]
  )

  if (!ready || !user || !hydrated || !applicationsHydrated) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  const counts = {
    total: mine.length,
    approved: mine.filter((t) => t.approvalStatus === "approved").length,
    pending: mine.filter((t) => t.approvalStatus === "pending").length,
    inactive: mine.filter((t) => !t.isActive).length,
  }
  const applicantsOf = (tuitionId) =>
    applications.filter((a) => a.tuitionId === tuitionId).length

  const handleEdit = async (data) => {
    setBusy(true)
    /* Editing a listing sends it back through admin review. */
    const result = await updateTutions(editing._id, {
      ...data,
      approvalStatus: "pending",
    })
    setBusy(false)
    if (!result.ok) return toast.error(result.error)
    setEditing(null)
    refetch()
    toast.success("Tuition updated — resubmitted for approval")
  }

  const handleToggle = async (tuition) => {
    const result = await updateTutions(tuition._id, {
      isActive: !tuition.isActive,
    })
    if (!result.ok) return toast.error(result.error)
    refetch()
    toast.success(tuition.isActive ? "Tuition paused" : "Tuition activated")
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    const result = await deleteTutions({ id: deleting._id })
    setBusy(false)
    setDeleting(null)
    if (!result.ok) return toast.error(result.error)
    refetch()
    toast.success("Tuition deleted")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tutor dashboard"
        title="My Tuitions"
        description="Everything you have posted — edit a listing, pause it, or remove it for good."
        actions={
          <Button render={<Link href="/dashboard/tutor/post-tuition" />}>
            <PlusCircle className="size-4" /> Post a tuition
          </Button>
        }
      />

      {/* ----------------------------- chips ----------------------------- */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { label: "Total posted", count: counts.total, className: "" },
          {
            label: "Approved",
            count: counts.approved,
            className: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Pending review",
            count: counts.pending,
            className: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Paused",
            count: counts.inactive,
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

      {/* ----------------------------- table ----------------------------- */}
      {mine.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No tuitions posted yet"
          description="Create your first listing — it only takes a couple of minutes and goes live once the admin approves it."
          actionLabel="Post a tuition"
          actionHref="/dashboard/tutor/post-tuition"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Tuition</TableHead>
                <TableHead className="px-4">Fee</TableHead>
                <TableHead className="px-4">Applicants</TableHead>
                <TableHead className="px-4">Posted</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mine.map((tuition) => (
                <TableRow key={tuition._id}>
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/tuitions/${tuition._id}`}
                      className="block max-w-72 truncate font-medium text-foreground transition-colors hover:text-primary"
                      title={tuition.title}
                    >
                      {tuition.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {tuition.subject} · {tuition.classLevel} · {tuition.mode}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold">
                    ৳{Number(tuition.monthlyFee).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {applicantsOf(tuition._id)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {fmtDate(tuition.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <StatusBadge status={tuition.approvalStatus} />
                      {!tuition.isActive && (
                        <StatusBadge status="closed" label="Paused" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setEditing(tuition)}
                      >
                        <Pencil className="size-3" /> Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleToggle(tuition)}
                        title={
                          tuition.isActive
                            ? "Pause listing"
                            : "Activate listing"
                        }
                      >
                        {tuition.isActive ? (
                          <>
                            <EyeOff className="size-3" /> Pause
                          </>
                        ) : (
                          <>
                            <Eye className="size-3" /> Activate
                          </>
                        )}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(tuition)}
                      >
                        <Trash2 className="size-3" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --------------------------- edit dialog -------------------------- */}
      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open && !busy) setEditing(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit tuition</DialogTitle>
            <DialogDescription>
              Changes are reviewed by an admin before going live again.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <TuitionForm
              key={editing._id}
              initialValues={editing}
              onSubmit={handleEdit}
              submitting={busy}
              submitLabel="Save changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --------------------------- delete dialog ------------------------ */}
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tuition?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `"${deleting.title}" and all of its applications will be permanently removed. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep tuition</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={handleDelete}
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" /> Delete forever
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
