"use client"

/* Reusable tuition form shared by "Post a Tuition" and the Edit dialog on
   "My Tuitions". The caller owns the pending state (`submitting`) and the
   submit handler (`onSubmit`), so toasts / navigation stay in the page. */

import { useEffect, useState } from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ImageUpload from "@/components/shared/image-upload"
import { CLASS_LEVELS, DAYS_PER_WEEK, MODES, SUBJECTS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const EMPTY = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "Online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "",
  schedule: "",
  description: "",
  bannerImage: "",
}

const MODE_HINTS = {
  Online:
    "Live sessions over Zoom or Google Meet — students join from anywhere.",
  Offline: "In-person classes at your place or at the student's location.",
}

/* tuition (store shape) → controlled form strings */
function toFormValues(initialValues) {
  const source = initialValues || {}
  const asString = (value) =>
    value === undefined || value === null ? "" : String(value)

  return {
    title: source.title ?? "",
    subject: source.subject ?? "",
    classLevel: source.classLevel ?? "",
    mode: source.mode || EMPTY.mode,
    location: source.location ?? "",
    monthlyFee: asString(source.monthlyFee),
    daysPerWeek: asString(source.daysPerWeek),
    schedule: source.schedule ?? "",
    description: source.description ?? "",
    bannerImage: source.bannerImage ?? "",
  }
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function TuitionForm({
  initialValues,
  onSubmit,
  submitting = false,
  submitLabel = "Submit",
}) {
  /* "new" = create mode — switching tuition id re-seeds the fields */
  const resetKey = initialValues?._id || "new"
  const [form, setForm] = useState(() => toFormValues(initialValues))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(toFormValues(initialValues))
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = "A tuition title is required."
    if (!form.subject) next.subject = "Please choose a subject."
    if (!form.classLevel) next.classLevel = "Please choose a class level."
    if (!form.mode) next.mode = "Please choose a teaching mode."
    if (!form.location.trim()) next.location = "A location is required."

    const fee = Number(form.monthlyFee)
    if (!form.monthlyFee || Number.isNaN(fee) || fee <= 0) {
      next.monthlyFee = "Enter a valid monthly fee."
    }

    if (!form.daysPerWeek) next.daysPerWeek = "Please choose days per week."
    if (!form.schedule.trim()) next.schedule = "Please add a weekly schedule."

    const description = form.description.trim()
    if (!description) next.description = "A description is required."
    else if (description.length < 40) {
      next.description = `Description must be at least 40 characters (${description.length}/40).`
    }

    if (!form.bannerImage) next.bannerImage = "Please upload a banner image."

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    await onSubmit({
      title: form.title.trim(),
      subject: form.subject,
      classLevel: form.classLevel,
      mode: form.mode,
      location: form.location.trim(),
      monthlyFee: Number(form.monthlyFee),
      daysPerWeek: Number(form.daysPerWeek),
      schedule: form.schedule.trim(),
      description: form.description.trim(),
      bannerImage: form.bannerImage,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ------------------------------ basics ------------------------------ */}
      <Field id="tf-title" label="Tuition title" error={errors.title}>
        <Input
          id="tf-title"
          value={form.title}
          onChange={setField("title")}
          placeholder="e.g. HSC Physics 1-on-1 Concept Coaching"
          className="h-10"
          disabled={submitting}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tf-subject">Subject</Label>
          <Select
            value={form.subject || null}
            onValueChange={(value) => setValue("subject", value)}
            disabled={submitting}
          >
            <SelectTrigger
              id="tf-subject"
              className="h-10 w-full"
              aria-label="Subject"
            >
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p className="text-xs text-destructive">{errors.subject}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tf-class">Class level</Label>
          <Select
            value={form.classLevel || null}
            onValueChange={(value) => setValue("classLevel", value)}
            disabled={submitting}
          >
            <SelectTrigger
              id="tf-class"
              className="h-10 w-full"
              aria-label="Class level"
            >
              <SelectValue placeholder="Select a class level" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classLevel && (
            <p className="text-xs text-destructive">{errors.classLevel}</p>
          )}
        </div>
      </div>

      {/* ------------------------------- mode ------------------------------- */}
      <div className="space-y-2">
        <Label>Teaching mode</Label>
        <RadioGroup
          value={form.mode}
          onValueChange={(value) => setValue("mode", value)}
          className="grid gap-3 sm:grid-cols-2"
        >
          {MODES.map((mode) => (
            <label
              key={mode}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                form.mode === mode
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-background hover:bg-muted/40"
              )}
            >
              <RadioGroupItem value={mode} className="mt-0.5" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {mode}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {MODE_HINTS[mode]}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
        {errors.mode && (
          <p className="text-xs text-destructive">{errors.mode}</p>
        )}
      </div>

      {/* ------------------------- fee & schedule -------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tf-fee">Monthly fee (৳)</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>
            <Input
              id="tf-fee"
              type="number"
              min={1}
              step={100}
              value={form.monthlyFee}
              onChange={setField("monthlyFee")}
              placeholder="4500"
              className="h-10 pl-7"
              disabled={submitting}
            />
          </div>
          {errors.monthlyFee && (
            <p className="text-xs text-destructive">{errors.monthlyFee}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tf-days">Days per week</Label>
          <Select
            value={form.daysPerWeek || null}
            onValueChange={(value) => setValue("daysPerWeek", value)}
            disabled={submitting}
          >
            <SelectTrigger
              id="tf-days"
              className="h-10 w-full"
              aria-label="Days per week"
            >
              <SelectValue placeholder="Select days per week" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_PER_WEEK.map((days) => (
                <SelectItem key={days} value={String(days)}>
                  {days} {days === 1 ? "day" : "days"} / week
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.daysPerWeek && (
            <p className="text-xs text-destructive">{errors.daysPerWeek}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="tf-location"
          label={form.mode === "Online" ? "Location / platform" : "Location"}
          error={errors.location}
          hint={
            form.mode === "Online"
              ? "e.g. Online (Google Meet)"
              : "e.g. Dhanmondi 27, Dhaka"
          }
        >
          <Input
            id="tf-location"
            value={form.location}
            onChange={setField("location")}
            placeholder={
              form.mode === "Online"
                ? "Online (Google Meet)"
                : "Dhanmondi 27, Dhaka"
            }
            className="h-10"
            disabled={submitting}
          />
        </Field>

        <Field
          id="tf-schedule"
          label="Weekly schedule"
          error={errors.schedule}
          hint="e.g. Sat, Mon & Wed · 5:00 PM – 6:30 PM"
        >
          <Input
            id="tf-schedule"
            value={form.schedule}
            onChange={setField("schedule")}
            placeholder="Sat, Mon & Wed · 5:00 PM – 6:30 PM"
            className="h-10"
            disabled={submitting}
          />
        </Field>
      </div>

      {/* --------------------------- description --------------------------- */}
      <div className="space-y-2">
        <Label htmlFor="tf-description">Description</Label>
        <Textarea
          id="tf-description"
          rows={5}
          value={form.description}
          onChange={setField("description")}
          placeholder="What does the tuition cover, what results can students expect, and how are classes conducted? Minimum 40 characters."
          disabled={submitting}
          aria-invalid={Boolean(errors.description)}
        />
        <p className="flex items-center justify-between gap-3 text-xs">
          {errors.description ? (
            <span className="text-destructive">{errors.description}</span>
          ) : (
            <span className="text-muted-foreground">
              Minimum 40 characters — be specific about outcomes.
            </span>
          )}
          <span
            className={cn(
              "shrink-0 tabular-nums",
              form.description.trim().length >= 40
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          >
            {form.description.trim().length}/40
          </span>
        </p>
      </div>

      {/* ----------------------------- banner ------------------------------ */}
      <div className="space-y-2">
        <Label>Banner image</Label>
        <ImageUpload
          label="Banner image"
          value={form.bannerImage}
          onChange={(url) => setValue("bannerImage", url)}
          hint="JPG or PNG · max 5 MB — shown at the top of your listing"
        />
        {errors.bannerImage && (
          <p className="text-xs text-destructive">{errors.bannerImage}</p>
        )}
      </div>

      {/* ----------------------------- submit ------------------------------ */}
      <div className="flex justify-end gap-2 border-t border-border pt-5">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {submitting ? `${submitLabel}…` : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default TuitionForm
