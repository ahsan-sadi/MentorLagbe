"use client"

import { useMemo } from "react"
import { Bookmark } from "lucide-react"

import EmptyState from "@/components/shared/empty-state"
import PageHeader from "@/components/shared/page-header"
import TuitionCard from "@/components/shared/tuition-card"
import { useRequireAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { useTutions } from "@/hooks/use-tutions"

/* Bookmarked listings for the signed-in student. */
export default function SavedTuitionsPage() {
  const { user, ready } = useRequireAuth(["student"])
  const { bookmarks } = useStore()
  const { tuitions, hydrated } = useTutions()

  const saved = useMemo(
    () =>
      tuitions
        .filter(
          (t) =>
            bookmarks.includes(t._id) &&
            t.approvalStatus === "approved" &&
            t.isActive
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [tuitions, bookmarks]
  )

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
        title="Saved Tuitions"
        description="Tuition listings you bookmarked — pick up right where you left off."
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved tuitions yet"
          description="Tap the bookmark icon on any tuition card while browsing and it will show up here."
          actionLabel="Browse tuitions"
          actionHref="/tuitions"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((tuition) => (
            <TuitionCard key={tuition._id} tuition={tuition} />
          ))}
        </div>
      )}
    </div>
  )
}
