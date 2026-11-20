"use client"

/* Thin auth layer on top of the mock store — mirrors the BetterAuth API
   surface (signIn / signUp / useSession) so a real backend can be swapped
   in later without touching the pages. */

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useStore } from "./store"
import { useSession } from "./auth-client"

export function useAuth() {
  const { currentUser, hydrated, actions } = useStore()

  return {
    user: currentUser,
    hydrated,
    isAuthenticated: Boolean(currentUser),
    role: currentUser?.role || null,
    signIn: actions.signIn,
    signUp: actions.signUp,
    signOut: actions.signOut,
    updateProfile: actions.updateProfile,
  }
}

/* Client-side route guard used by the dashboard layout.
   Identity comes from the real session (better-auth `useSession()`), so the
   `role` on the session user decides which dashboard each user may see. */
export function useRequireAuth(allowedRoles = null) {
  const { data, isPending } = useSession()
  const router = useRouter()

  const user = data?.user ?? null
  /* isPending stays true until /get-session answers — no premature redirect. */
  const hydrated = !isPending

  const denied =
    hydrated &&
    (!user || (allowedRoles && !allowedRoles.includes(user.role)))

  useEffect(() => {
    if (isPending) return
    if (!user) {
      router.replace("/sign-in")
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(dashboardHome(user.role))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, user, router])

  return {
    user,
    ready:
      !isPending &&
      Boolean(user) &&
      (!allowedRoles || allowedRoles.includes(user.role)),
    denied,
  }
}

export function dashboardHome(role) {
  if (role === "admin") return "/dashboard/admin"
  if (role === "tutor") return "/dashboard/tutor"
  return "/dashboard/student"
}
