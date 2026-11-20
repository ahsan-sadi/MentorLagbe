"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, BadgeCheck, Search, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const trustAvatars = [
  "https://api.dicebear.com/9.x/notionists/svg?seed=Tanvir&backgroundColor=eef2ff",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Sadia&backgroundColor=f5f3ff",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Mehedi&backgroundColor=ecfeff",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Ayesha&backgroundColor=eef2ff",
]

export function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (event) => {
    event.preventDefault()
    const q = query.trim()
    router.push(q ? `/tuitions?q=${encodeURIComponent(q)}` : "/tuitions")
  }

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* decorative background */}
      <div
        className="hero-grid-bg pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="glow-dot pointer-events-none absolute -top-24 -right-24 size-96 rounded-full opacity-70"
        aria-hidden
      />
      <div
        className="glow-dot pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full opacity-60"
        aria-hidden
      />

      <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up text-center lg:text-left">
          <span className="eyebrow">🎯 1,250+ live tuition batches</span>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            Find Your Ideal <span className="text-gradient">Tutor</span> or
            Mentorship Batch <span className="text-gradient">Today</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            MentorLagbe brings verified tutors and ambitious students together —
            search approved tuition listings, apply in seconds, and manage
            everything from one clean dashboard.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2.5 sm:flex-row lg:mx-0"
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or subject — e.g. IELTS, Physics…"
                className="h-12 rounded-xl border-border bg-background pl-10 shadow-sm"
                aria-label="Search tuitions"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-xl px-6">
              Search <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
            <span className="flex items-center gap-2">
              <span className="flex -space-x-2">
                {trustAvatars.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="size-7 rounded-full border-2 border-background bg-muted"
                  />
                ))}
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Users className="size-4 text-primary" /> 9,600+ students
              </span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" /> 4.9/5
              average rating
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <BadgeCheck className="size-4 text-primary" /> 480+ verified
              tutors
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button size="lg" render={<Link href="/tuitions" />}>
              Browse Tuitions <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/sign-up" />}
            >
              Become a Tutor
            </Button>
          </div>
        </div>

        {/* hero visual */}
        <div className="animate-fade-up-1 relative mx-auto w-full max-w-lg">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-indigo-500/10">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=75"
              alt="Students learning together with a tutor"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -left-4 hidden w-60 rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/9.x/notionists/svg?seed=Tanvir&backgroundColor=eef2ff"
                alt=""
                className="size-10 rounded-full border border-border"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  HSC Physics Coaching
                </p>
                <p className="text-xs text-muted-foreground">
                  Approved · Online &amp; Offline
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="font-semibold text-primary">৳6,000/month</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <BadgeCheck className="size-3.5 text-emerald-500" /> Verified
                tutor
              </span>
            </div>
          </div>

          <div className="absolute -top-5 -right-3 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:block">
            <p className="text-xs text-muted-foreground">
              Applications this week
            </p>
            <p className="font-heading text-xl font-extrabold text-foreground">
              1,024
            </p>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              ↑ 18% vs last week
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
