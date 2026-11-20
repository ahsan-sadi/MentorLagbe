"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { dashboardHome, useRequireAuth } from "@/lib/auth-context"

/* /dashboard → send the signed-in user to their role home */
export default function DashboardIndexPage() {
  const router = useRouter()
  const { user, ready } = useRequireAuth()

  useEffect(() => {
    if (!ready) return
    if (user) router.replace(dashboardHome(user.role))
    else router.replace("/sign-in")
  }, [ready, user, router])

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
      Opening your dashboard…
    </div>
  )
}
