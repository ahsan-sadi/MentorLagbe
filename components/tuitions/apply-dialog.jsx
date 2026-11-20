"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Send, ShieldCheck } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"

/** Role-restricted application form (students only, one per tuition). */
export function ApplyDialog({ tuition, alreadyApplied = false, trigger }) {
  const { actions } = useStore()
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({
    studentPhone: user?.phone || "",
    preferredSchedule: tuition.schedule || "",
    studentNote: "",
  })
  const [errors, setErrors] = useState({})

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.studentPhone.trim())
      next.studentPhone = "Phone number is required."
    else if (form.studentPhone.replace(/\D/g, "").length < 10)
      next.studentPhone = "Enter a valid phone number."
    if (!form.preferredSchedule.trim())
      next.preferredSchedule = "Preferred schedule is required."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)
    const result = await actions.applyToTuition(tuition._id, form)
    setPending(false)
    if (!result.ok) {
      toast.error(result.error)
      setOpen(false)
      return
    }
    toast.success("Application submitted — the tutor will review it soon")
    setOpen(false)
    setForm((prev) => ({ ...prev, studentNote: "" }))
  }

  const isStudent = isAuthenticated && user?.role === "student"

  if (!isAuthenticated) {
    return (
      <div className="space-y-2">
        <Button className="w-full" render={<Link href="/sign-in" />}>
          Sign in as a student to apply
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Only accounts with the Student role can apply.
        </p>
      </div>
    )
  }

  if (!isStudent) {
    return (
      <div className="space-y-2">
        <Button className="w-full" disabled>
          Apply for this tuition
        </Button>
        <p className="flex items-start justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Applications are open to students only — you are signed in as a{" "}
          <span className="capitalize">{user.role}</span>.
        </p>
      </div>
    )
  }

  if (alreadyApplied) {
    return (
      <div className="space-y-2">
        <Button
          className="w-full"
          variant="outline"
          render={<Link href="/dashboard/student/my-applications" />}
        >
          You already applied — view status
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          One application per tuition is allowed.
        </p>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full" size="lg" />}>
        <Send className="size-4" /> Apply for Tuition
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Apply for this tuition
          </DialogTitle>
          <DialogDescription>
            {tuition.title} — your contact details are shared with{" "}
            {tuition.tutorName} only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="apply-phone">Your phone</Label>
              <Input
                id="apply-phone"
                placeholder="+880 1XXX-XXXXXX"
                value={form.studentPhone}
                onChange={setField("studentPhone")}
                aria-invalid={Boolean(errors.studentPhone)}
              />
              {errors.studentPhone && (
                <p className="text-xs text-destructive">
                  {errors.studentPhone}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apply-email">Email</Label>
              <Input id="apply-email" value={user.email} disabled />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apply-schedule">Preferred schedule</Label>
            <Input
              id="apply-schedule"
              placeholder="e.g. Sat, Mon & Wed · 5:00 PM – 6:30 PM"
              value={form.preferredSchedule}
              onChange={setField("preferredSchedule")}
              aria-invalid={Boolean(errors.preferredSchedule)}
            />
            {errors.preferredSchedule && (
              <p className="text-xs text-destructive">
                {errors.preferredSchedule}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apply-note">Learning note (optional)</Label>
            <Textarea
              id="apply-note"
              rows={4}
              placeholder="Tell the tutor what you want to achieve, your current level, and any challenges…"
              value={form.studentNote}
              onChange={setField("studentNote")}
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Monthly fee:{" "}
            <span className="font-semibold text-foreground">
              ৳{Number(tuition.monthlyFee).toLocaleString()}
            </span>{" "}
            · {tuition.mode} · {tuition.classLevel}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Submit application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ApplyDialog
