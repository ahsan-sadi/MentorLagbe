"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Info, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/shared/page-header"
import { TuitionForm } from "@/components/dashboard/tuition-form"
import { useRequireAuth } from "@/lib/auth-context"
import { useTutions } from "@/hooks/use-tutions"
import { FREE_TUTOR_POST_LIMIT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { createTutions } from "@/lib/actions/tutions"
import { getTutionsCount } from "@/lib/api/tutions"

/* Create a new tuition listing. The free-plan post limit is checked here
   (the API stores whatever it's given), any rejection comes back as a toast. */
export default function PostTuitionPage() {
  const router = useRouter()
  const { user, ready } = useRequireAuth(["tutor"])
  const { tuitions, hydrated } = useTutions()
  const [submitting, setSubmitting] = useState(false)

  if (!ready || !user || !hydrated) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  const mine = tuitions.filter((t) => t.tutorEmail === user.email)
  const isPro = user.plan === "pro"
  const slotsLeft = Math.max(0, FREE_TUTOR_POST_LIMIT - mine.length)
  const canPost = isPro || slotsLeft > 0

  const handleSubmit = async (data) => {
    /* Free-plan cap, confirmed against the API (the source of truth). If the
       count endpoint can't be reached we fall back to the list already
       loaded, so a flaky network never blocks a post. */
    if (!isPro) {
      const countResult = await getTutionsCount(user.email)
      const mineCount = countResult.ok ? countResult.count : mine.length
      if (mineCount >= FREE_TUTOR_POST_LIMIT) {
        toast.error(
          `Free plan limit reached (${FREE_TUTOR_POST_LIMIT} tuitions). Upgrade to Pro for unlimited posts.`
        )
        /* Tutors have no transactions page — the upgrade flow lives on /pricing. */
        router.push("/pricing")
        return
      }
    }
    setSubmitting(true)
    const result = await createTutions({
      ...data,
      tutorName: user.name,
      tutorEmail: user.email,
      tutorPlan: user.plan || "free",
      approvalStatus: "pending",
      isActive: true,
      createdAt: new Date().toISOString(),
    })
    setSubmitting(false)
    if (!result.ok) return toast.error(result.error)
    toast.success("Tuition submitted for admin approval")
    router.push("/dashboard/tutor/my-tuitions")
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground"
          render={<Link href="/dashboard/tutor" />}
        >
          <ArrowLeft className="size-4" /> Back to overview
        </Button>
        <PageHeader
          eyebrow="Tutor dashboard"
          title="Post a new tuition"
          description="Fill in the details below. Your listing goes live on the browse page once an admin approves it."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Listing details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TuitionForm
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="Submit for approval"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* ------------------------- plan slot ------------------------- */}
          <Card
            className={cn(
              "rounded-2xl",
              canPost
                ? "border-border"
                : "border-amber-300 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10"
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                {isPro ? (
                  <>
                    <Sparkles className="size-4 text-violet-500" /> Pro plan
                    active
                  </>
                ) : (
                  <>Free plan slots</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {isPro ? (
                <p>
                  You can post{" "}
                  <strong className="text-foreground">unlimited</strong>{" "}
                  tuitions. Each new listing still needs admin approval.
                </p>
              ) : (
                <p>
                  You have{" "}
                  <strong className="text-foreground">
                    {slotsLeft} of {FREE_TUTOR_POST_LIMIT}
                  </strong>{" "}
                  free post slot{slotsLeft === 1 ? "" : "s"} remaining.
                </p>
              )}
              {!isPro && (
                <Button className="w-full" render={<Link href="/pricing" />}>
                  Upgrade to Pro — $15/mo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* --------------------------- tips --------------------------- */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <Info className="size-4 text-primary" /> Tips for approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  "Write a clear, specific title (subject + class level works well).",
                  "Describe the syllabus, your teaching style and expectations.",
                  "Upload a clean banner image — listings with images get seen more.",
                  "Keep the schedule realistic and mention the location clearly.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
