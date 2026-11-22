"use client"

import { Bookmark } from "lucide-react"

import EmptyState from "@/components/shared/empty-state"
import PageHeader from "@/components/shared/page-header"
import TuitionCard from "@/components/shared/tuition-card"
import { useRequireAuth } from "@/lib/auth-context"
import { useBookmarks } from "@/hooks/use-bookmarks"

export default function SavedTuitionsPage() {
  const { user, ready } = useRequireAuth(["student"])
  const { bookmarks, hydrated } = useBookmarks()

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

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved tuitions yet"
          description="Tap the bookmark icon on any tuition card while browsing and it will show up here."
          actionLabel="Browse tuitions"
          actionHref="/tuitions"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {bookmarks.map(({ tuition }) =>
            tuition ? (
              <TuitionCard key={tuition._id} tuition={tuition} />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}