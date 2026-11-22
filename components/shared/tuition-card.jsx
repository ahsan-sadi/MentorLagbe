"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Bookmark, MapPin, Monitor, PencilRuler, Wallet, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/role-badge"
import { useAuth } from "@/lib/auth-context"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { cn } from "@/lib/utils"

/**
 * Equal-height tuition card used on Home (featured), Browse Tuitions
 * and the Saved Tuitions tab.
 */
export function TuitionCard({ tuition, showStatus = false, showRating = false }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { isBookmarked, add, remove } = useBookmarks()
  const saved = isBookmarked(tuition._id)

  const toggleBookmark = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isAuthenticated) {
      toast.info("Sign in to save tuitions")
      router.push("/sign-in")
      return
    }
    if (saved) {
      const result = await remove(tuition._id)
      if (result.ok) toast.success("Removed from saved tuitions")
    } else {
      const result = await add(tuition._id)
      if (result.ok) toast.success("Saved to your tuitions")
    }
  }

  return (
    <article className="group card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Link
        href={`/tuitions/${tuition._id}`}
        className="relative block overflow-hidden"
      >
        <img
          src={tuition.bannerImage}
          alt={tuition.title}
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {tuition.mode === "Online" ? (
              <Monitor className="size-3" />
            ) : (
              <PencilRuler className="size-3" />
            )}
            {tuition.mode}
          </Badge>
          {showStatus && <StatusBadge status={tuition.approvalStatus} />}
          {!tuition.isActive && <StatusBadge status="closed" label="Closed" />}
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={saved ? "Remove bookmark" : "Save tuition"}
            className={cn(
              "absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/90 backdrop-blur transition-colors",
              saved
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </button>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="text-primary">{tuition.subject}</span>
          <span aria-hidden>•</span>
          <span>{tuition.classLevel}</span>
        </div>

        <Link href={`/tuitions/${tuition._id}`}>
          <h3 className="mt-2 line-clamp-2 font-heading text-base leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
            {tuition.title}
          </h3>
        </Link>

        {showRating && tuition.rating && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
            <Star className="size-4 fill-current" />
            <span className="font-semibold">{tuition.rating}</span>
            <span className="text-muted-foreground">({tuition.reviewCount || 0})</span>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {tuition.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="size-3.5" />
            <span className="font-semibold text-foreground">
              ৳{Number(tuition.monthlyFee).toLocaleString()}
            </span>
            /month
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <img
            src={
              tuition.tutorAvatar ||
              `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(tuition.tutorName)}`
            }
            alt={tuition.tutorName}
            className="size-7 rounded-full border border-border bg-muted"
          />
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {tuition.tutorName}
          </span>
        </div>

        <div className="mt-4">
          <Button
            className="w-full"
            render={<Link href={`/tuitions/${tuition._id}`} />}
          >
            View Details
          </Button>
        </div>
      </div>
    </article>
  )
}

export default TuitionCard