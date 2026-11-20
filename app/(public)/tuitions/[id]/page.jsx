"use client"

import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Clock,
  Globe,
  MapPin,
  Monitor,
  PencilRuler,
  Star,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { StatusBadge } from "@/components/shared/role-badge"
import ApplyDialog from "@/components/tuitions/apply-dialog"
import { useStore } from "@/lib/store"
import { useTution } from "@/hooks/use-tutions"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export default function TuitionDetailsPage() {
  const { id } = useParams()
  const { reviews, applications, bookmarks, actions } = useStore()
  const { tuition, hydrated } = useTution(id)
  const { user, isAuthenticated } = useAuth()
  const [ready, setReady] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 250)
    return () => clearTimeout(timer)
  }, [])

  if (!hydrated || !ready) {
    return (
      <div className="container-page space-y-6 py-10">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!tuition) notFound()

  const tuitionReviews = reviews.filter((r) => r.tuitionId === tuition._id)
  const avgRating = tuitionReviews.length
    ? (
        tuitionReviews.reduce((sum, r) => sum + r.rating, 0) /
        tuitionReviews.length
      ).toFixed(1)
    : null

  const myApplication = applications.find(
    (a) => a.tuitionId === tuition._id && a.studentEmail === user?.email
  )
  const saved = bookmarks.includes(tuition._id)
  const isOwner = user?.email === tuition.tutorEmail

  const canReview =
    isAuthenticated &&
    user?.role === "student" &&
    myApplication?.status === "accepted" &&
    !tuitionReviews.some((r) => r.studentName === user.name)

  const submitReview = async (event) => {
    event.preventDefault()
    if (!comment.trim()) {
      toast.error("Please write a short review")
      return
    }
    setSubmitting(true)
    const result = await actions.addReview({
      tuitionId: tuition._id,
      rating,
      comment,
    })
    setSubmitting(false)
    if (!result.ok) return toast.error(result.error)
    setComment("")
    toast.success("Thanks for your review!")
  }

  const meta = [
    { icon: Globe, label: "Subject", value: tuition.subject },
    { icon: CalendarDays, label: "Class level", value: tuition.classLevel },
    {
      icon: tuition.mode === "Online" ? Monitor : PencilRuler,
      label: "Mode",
      value: tuition.mode,
    },
    { icon: MapPin, label: "Location", value: tuition.location },
    { icon: Clock, label: "Schedule", value: tuition.schedule },
    {
      icon: Wallet,
      label: "Monthly fee",
      value: `৳${Number(tuition.monthlyFee).toLocaleString()}`,
      strong: true,
    },
  ]

  return (
    <div className="container-page py-8 sm:py-12">
      <Link
        href="/tuitions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Back to all tuitions
      </Link>

      {/* banner */}
      <div className="relative mt-5 overflow-hidden rounded-3xl border border-border">
        <img
          src={tuition.bannerImage}
          alt={tuition.title}
          className="h-56 w-full object-cover sm:h-72 lg:h-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute right-5 bottom-5 left-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-background/90 text-foreground backdrop-blur">
              {tuition.mode === "Online" ? (
                <Monitor className="size-3" />
              ) : (
                <PencilRuler className="size-3" />
              )}
              {tuition.mode}
            </Badge>
            <Badge className="bg-background/90 text-foreground backdrop-blur">
              {tuition.classLevel}
            </Badge>
            {isOwner && <StatusBadge status={tuition.approvalStatus} />}
            {!tuition.isActive && (
              <StatusBadge status="closed" label="Closed" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* ------------------------ main column ------------------------ */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-primary">
                {tuition.subject}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                Posted {fmtDate(tuition.createdAt)}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {tuition.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <img
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(tuition.tutorName)}`}
                  alt=""
                  className="size-7 rounded-full border border-border bg-muted"
                />
                <span className="font-medium text-foreground">
                  {tuition.tutorName}
                </span>
                {tuition.tutorPlan === "pro" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                    <BadgeCheck className="size-3" /> Pro tutor
                  </span>
                )}
              </span>
              {avgRating && (
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {avgRating}
                  <span className="font-normal text-muted-foreground">
                    ({tuitionReviews.length})
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* meta grid */}
          <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
            {meta.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "block text-sm break-words",
                        item.strong
                          ? "font-heading font-extrabold text-primary"
                          : "font-medium text-foreground"
                      )}
                    >
                      {item.value}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* description */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                About this tuition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {tuition.description}
              </p>
              <Separator className="my-5" />
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">
                    Days per week:
                  </span>{" "}
                  {tuition.daysPerWeek}
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    Teaching mode:
                  </span>{" "}
                  {tuition.mode}
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    Enrollment:
                  </span>{" "}
                  {tuition.isActive ? "Open" : "Closed"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* --------------------------- reviews --------------------------- */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Student reviews
                {avgRating && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ★ {avgRating}/5 · {tuitionReviews.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tuitionReviews.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No reviews yet — students who get accepted can share their
                  experience here.
                </p>
              )}
              {tuitionReviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">
                      {review.studentName}
                    </span>
                    <span className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    {fmtDate(review.createdAt)}
                  </p>
                </div>
              ))}

              {canReview && (
                <form
                  onSubmit={submitReview}
                  className="space-y-3 border-t border-border pt-4"
                >
                  <Label className="text-sm font-semibold">
                    Leave a review
                  </Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        aria-label={`${value} star`}
                        className="p-0.5"
                      >
                        <Star
                          className={cn(
                            "size-5",
                            value <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    rows={3}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="How was your learning experience with this tutor?"
                  />
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? "Posting…" : "Post review"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ------------------------ sidebar ------------------------ */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-2xl shadow-lg shadow-indigo-500/5">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Monthly fee
                </p>
                <p className="text-gradient font-heading text-4xl font-extrabold tracking-tight">
                  ৳{Number(tuition.monthlyFee).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tuition.daysPerWeek} days/week · {tuition.mode}
                </p>
              </div>

              <ApplyDialog
                tuition={tuition}
                alreadyApplied={Boolean(myApplication)}
              />

              <Button
                variant="outline"
                className="w-full"
                disabled={!isAuthenticated}
                onClick={async () => {
                  if (!isAuthenticated) {
                    toast.info("Sign in to save tuitions")
                    return
                  }
                  await actions.toggleBookmark(tuition._id)
                  toast.success(
                    saved
                      ? "Removed from saved tuitions"
                      : "Saved to your tuitions"
                  )
                }}
              >
                <Bookmark className={cn("size-4", saved && "fill-current")} />
                {saved ? "Saved" : "Save for later"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-base">
                About the tutor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(tuition.tutorName)}`}
                  alt=""
                  className="size-12 rounded-full border border-border bg-muted"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{tuition.tutorName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tuition.tutorEmail}
                  </p>
                </div>
              </div>
              <Separator />
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  {tuition.tutorPlan === "pro"
                    ? "Verified Pro tutor on MentorLagbe"
                    : "Registered tutor on MentorLagbe"}
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  Listing approved by the admin team
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  Responds to applications within 24 hours
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
