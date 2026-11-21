"use client"

/* Thin auth layer over the real session — mirrors the BetterAuth API surface
   (signIn / signUp / useSession) so pages never touch the session directly. */

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useStore } from "./store"
import { useSession } from "./auth-client"

export function useAuth() {
  /* Identity comes from the real session (better-auth `useSession()`), so a
     user signed in through /sign-in is recognised across the whole app. The
     mock store's `currentUser` only holds the local demo session and stays
     `null` for real sign-ins. */
  const { data, isPending } = useSession()
  const { actions } = useStore()
  const user = data?.user ?? null

  return {
    user,
    /* false until /get-session answers — let pages show a loading state
       instead of flashing "Sign in" at an already signed-in user. */
    hydrated: !isPending,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    signIn: actions.signIn,
    signUp: actions.signUp,
    /* Demo-store sign-out; pair it with `signOutEverywhere()` for the real
       session (call sites already do `Promise.allSettled([...])`). */
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
