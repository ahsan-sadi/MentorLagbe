"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import PageHeader from "@/components/shared/page-header"
import TuitionCard from "@/components/shared/tuition-card"
import EmptyState from "@/components/shared/empty-state"
import { TuitionGridSkeleton } from "@/components/shared/skeletons"
import { useTutions } from "@/hooks/use-tutions"
import { CLASS_LEVELS, MODES, SUBJECTS } from "@/lib/constants"

const PER_PAGE = 6

export default function BrowseTuitions({ serverParams = {} }) {
  const router = useRouter()
  const pathname = usePathname()
  const { tuitions, hydrated } = useTutions()

  const [q, setQ] = useState(serverParams.q || "")
  const [subject, setSubject] = useState(serverParams.subject || "")
  const [classLevel, setClassLevel] = useState(serverParams.classLevel || "")
  const [mode, setMode] = useState(serverParams.mode || "")
  const [page, setPage] = useState(Number(serverParams.page) || 1)
  const [ready, setReady] = useState(false)

  /* keep local state in sync when the URL changes (back/forward, links) —
     React's documented "adjust state when props change" pattern (during
     render, so there's no extra commit). Compared by value, not identity. */
  const paramsKey = JSON.stringify(serverParams)
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey)
  if (prevParamsKey !== paramsKey) {
    setPrevParamsKey(paramsKey)
    setQ(serverParams.q || "")
    setSubject(serverParams.subject || "")
    setClassLevel(serverParams.classLevel || "")
    setMode(serverParams.mode || "")
    setPage(Number(serverParams.page) || 1)
  }

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  /* latest-copy ref so the debounced effect never calls a stale closure */
  const updateUrlRef = useRef(null)
  const updateUrl = (patch) => {
    const next = {
      q: patch.q !== undefined ? patch.q : q,
      subject: patch.subject !== undefined ? patch.subject : subject,
      classLevel:
        patch.classLevel !== undefined ? patch.classLevel : classLevel,
      mode: patch.mode !== undefined ? patch.mode : mode,
      page: patch.page !== undefined ? patch.page : 1,
    }
    const sp = new URLSearchParams()
    Object.entries(next).forEach(([key, value]) => {
      if (value && value !== "1") sp.set(key, String(value))
    })
    const qs = sp.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }
  useEffect(() => {
    updateUrlRef.current = updateUrl
  })

  /* debounced search → URL */
  useEffect(() => {
    const initial = serverParams.q || ""
    if (q === initial) return
    const timer = setTimeout(() => updateUrlRef.current({ q }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return tuitions
      .filter((t) => t.approvalStatus === "approved" && t.isActive)
      .filter((t) => {
        if (!needle) return true
        return (
          t.title.toLowerCase().includes(needle) ||
          t.subject.toLowerCase().includes(needle) ||
          t.tutorName.toLowerCase().includes(needle)
        )
      })
      .filter((t) => (subject ? t.subject === subject : true))
      .filter((t) => (classLevel ? t.classLevel === classLevel : true))
      .filter((t) => (mode ? t.mode === mode : true))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [tuitions, q, subject, classLevel, mode])

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visible = results.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  )

  const hasFilters = Boolean(q || subject || classLevel || mode)
  const clearFilters = () => {
    setQ("")
    setSubject("")
    setClassLevel("")
    setMode("")
    updateUrl.current({ q: "", subject: "", classLevel: "", mode: "", page: 1 })
  }

  const selectClass = "w-full sm:w-44"

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Browse tuitions"
        title="Find a batch or mentor that fits"
        description="Every listing below has been reviewed and approved by our admin team. Search by title, subject or tutor — then filter by class level and mode."
      />

      {/* --------------------------- filter bar --------------------------- */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search title, subject or tutor…"
              className="h-10 pl-10"
              aria-label="Search tuitions"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              value={subject || null}
              onValueChange={(value) =>
                updateUrl({ subject: value === "all" ? "" : value })
              }
            >
              <SelectTrigger
                className={selectClass}
                aria-label="Filter by subject"
              >
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {SUBJECTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={classLevel || null}
              onValueChange={(value) =>
                updateUrl({ classLevel: value === "all" ? "" : value })
              }
            >
              <SelectTrigger
                className={selectClass}
                aria-label="Filter by class level"
              >
                <SelectValue placeholder="All class levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All class levels</SelectItem>
                {CLASS_LEVELS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={mode || null}
              onValueChange={(value) =>
                updateUrl({ mode: value === "all" ? "" : value })
              }
            >
              <SelectTrigger
                className={selectClass}
                aria-label="Filter by mode"
              >
                <SelectValue placeholder="Online or Offline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Online &amp; Offline</SelectItem>
                {MODES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            <span>
              <span className="font-semibold text-foreground">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "tuition" : "tuitions"} found
              {hasFilters && " with the current filters"}
            </span>
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-4" /> Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* ---------------------------- results ---------------------------- */}
      <div className="mt-8">
        {!ready || !hydrated ? (
          <TuitionGridSkeleton count={6} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No tuitions match those filters"
            description="Try a different subject or class level, or clear the filters to see all approved listings."
            actionLabel="Clear filters"
            actionHref="/tuitions"
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((tuition) => (
                <TuitionCard key={tuition._id} tuition={tuition} />
              ))}
            </div>

            {/* ------------------------- pagination ------------------------ */}
            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-2"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => updateUrl({ page: currentPage - 1 })}
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const number = index + 1
                    const active = number === currentPage
                    return (
                      <button
                        key={number}
                        type="button"
                        onClick={() => updateUrl({ page: number })}
                        aria-current={active ? "page" : undefined}
                        className={
                          active
                            ? "flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                            : "flex size-8 items-center justify-center rounded-lg border border-border text-sm text-muted-foreground transition-colors hover:bg-muted"
                        }
                      >
                        {number}
                      </button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => updateUrl({ page: currentPage + 1 })}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
