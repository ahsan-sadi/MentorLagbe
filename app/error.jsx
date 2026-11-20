"use client"

/* Root error boundary (Next 16: receives { error, retry }). */

import { useEffect } from "react"
import Link from "next/link"
import { Home, RefreshCcw, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ error, retry }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const message =
    error instanceof Error
      ? error.message
      : "Something unexpected happened while loading this page."

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
        <TriangleAlert className="size-8" />
      </span>

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try
        again, or head back to the home page.
      </p>

      <p className="mt-4 max-w-md rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs break-words text-muted-foreground">
        {message}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>
          <RefreshCcw className="size-4" /> Try again
        </Button>
        <Button variant="outline" render={<Link href="/" />}>
          <Home className="size-4" /> Back to Home
        </Button>
      </div>
    </div>
  )
}
