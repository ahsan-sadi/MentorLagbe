"use client"

import { useState } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar"
import Topbar from "@/components/dashboard/topbar"
import { Skeleton } from "@/components/ui/skeleton"
import { useRequireAuth } from "@/lib/auth-context"

function LayoutSkeleton() {
  return (
    <div className="flex min-h-svh bg-muted/40">
      <div className="hidden w-64 shrink-0 border-r border-border bg-card p-4 lg:block">
        <Skeleton className="h-9 w-36" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

/* Shared shell for every /dashboard/* route — auth guard + sidebar + topbar. */
export default function DashboardLayout({ children }) {
  const { user, ready } = useRequireAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (!ready) return <LayoutSkeleton />

  return (
    <div className="flex min-h-svh bg-muted/40">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          menu={
            <MobileNav
              user={user}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open dashboard menu"
                >
                  <Menu className="size-5" />
                </Button>
              }
            />
          }
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
