"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import TuitionCard from "@/components/shared/tuition-card"
import { TuitionGridSkeleton } from "@/components/shared/skeletons"
import { useTutions } from "@/hooks/use-tutions"

/** 6 latest approved & active tuitions, loaded from the API. */
export function FeaturedTuitions() {
  const { tuitions, hydrated } = useTutions()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 350)
    return () => clearTimeout(timer)
  }, [])

  const featured = tuitions
    .filter((t) => t.approvalStatus === "approved" && t.isActive)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  return (
    <section className="section bg-background">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Featured listings</p>
            <h2 className="section-title mt-3">Latest approved tuitions</h2>
            <p className="section-lead">
              Fresh batches and 1-on-1 mentorships, hand-checked by our admin
              team before going live.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/tuitions" />}>
            View all tuitions <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="mt-10">
          {!ready || !hydrated ? (
            <TuitionGridSkeleton count={6} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((tuition) => (
                <TuitionCard key={tuition._id} tuition={tuition} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FeaturedTuitions
