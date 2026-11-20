"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronsLeft, LayoutDashboard, LogOut, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Logo } from "@/components/site/logo"
import { getNavItems } from "@/components/dashboard/nav-config"
import { dashboardHome, useAuth } from "@/lib/auth-context"
import { signOutEverywhere } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function NavList({ user, collapsed = false, onNavigate }) {
  const pathname = usePathname()
  const items = getNavItems(user.role)

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {items.map((item) => {
        const Icon = item.icon
        const active =
          item.href === `/dashboard/${user.role}`
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

function PlanCard({ user, collapsed }) {
  const router = useRouter()
  if (collapsed) return null
  const isPro = user.plan === "pro"

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-3.5 dark:border-violet-500/25 dark:bg-violet-500/10">
      <div className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
        <Sparkles className="size-4" />
        {isPro ? "Pro plan active" : "Free plan"}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-violet-600/90 dark:text-violet-200/80">
        {isPro
          ? "Unlimited posts, verified badge and priority ranking are unlocked."
          : user.role === "tutor"
            ? "Upgrade for unlimited tuition posts and a verified badge."
            : "Upgrade for priority booking and direct tutor access."}
      </p>
      {!isPro && (
        <Button
          size="sm"
          className="mt-3 w-full bg-violet-600 text-white hover:bg-violet-500"
          onClick={() => router.push("/pricing")}
        >
          Upgrade to Pro
        </Button>
      )}
    </div>
  )
}

export function Sidebar({ user, collapsed, onToggleCollapse }) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-border",
          collapsed ? "justify-center px-3" : "justify-between px-4"
        )}
      >
        <Logo href={dashboardHome(user.role)} compact={collapsed} />
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="mb-2 w-full"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
          >
            <LayoutDashboard className="size-4 opacity-0" />
            <span className="rotate-180 text-xs">»</span>
          </Button>
        )}
        <NavList user={user} collapsed={collapsed} />
      </div>

      <div className="space-y-3 border-t border-border p-3">
        <PlanCard user={user} collapsed={collapsed} />
        <SignOutButton collapsed={collapsed} />
      </div>
    </aside>
  )
}

function SignOutButton({ collapsed }) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    /* Revokes the session on every device and clears the demo-store session. */
    await Promise.allSettled([signOutEverywhere(), signOut()])
    toast.success("Signed out from all devices")
    router.push("/")
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-muted-foreground hover:text-destructive",
        collapsed && "justify-center px-0"
      )}
      onClick={handleSignOut}
    >
      <LogOut className="size-4" />
      {!collapsed && "Sign Out"}
    </Button>
  )
}

export function MobileNav({ user, trigger }) {
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <Sheet>
      <SheetTrigger render={trigger} />
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Dashboard menu</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <Logo href={dashboardHome(user.role)} className="mb-5" />
          <NavList user={user} />
          <div className="mt-5">
            <PlanCard user={user} />
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={async () => {
              await Promise.allSettled([signOutEverywhere(), signOut()])
              toast.success("Signed out from all devices")
              router.push("/")
              router.refresh()
            }}
          >
            <LogOut className="size-4" /> Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
