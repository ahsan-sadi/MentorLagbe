"use client"

/* Thin auth layer over the BetterAuth session — provides user, JWT token, and
   auth actions.

   The JWT comes from Better Auth's `jwt()` plugin on the SAME origin
   (GET /api/auth/token), via lib/auth-token.js. One token is cached for the
   whole app and every `useAuth()` consumer subscribes to it, so the value is
   ready before the user can click "Apply" / "Submit for approval". */

import { useRouter } from "next/navigation"
import { useEffect, useCallback, useSyncExternalStore } from "react"
import { useStore } from "./store"
import { authClient, useSession } from "./auth-client"
import {
  getToken,
  clearToken,
  getCachedToken,
  subscribeToken,
} from "./auth-token"

export function useAuth() {
  const { data, isPending } = useSession()
  const { actions } = useStore()
  const user = data?.user ?? null

  /* Shared, cached JWT — null until a session exists. */
  const token = useSyncExternalStore(subscribeToken, getCachedToken, () => null)

  /* Warm the cache as soon as the session resolves (and again right after a
     sign-in, when the session flips from null to a user). */
  useEffect(() => {
    if (isPending) return
    if (user) getToken()
    else clearToken()
  }, [isPending, user])

  const refreshToken = useCallback(() => getToken({ force: true }), [])

  return {
    user,
    token,
    hydrated: !isPending,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    signIn: actions.signIn,
    signUp: actions.signUp,
    /* Clear the JWT first, then end the Better Auth session for real — the
       mock store alone would leave `useSession()` reporting the user as
       still signed in. */
    signOut: async () => {
      clearToken()
      try {
        await authClient.signOut()
      } catch {
        /* the local cache is already cleared — continue regardless */
      }
      return actions.signOut()
    },
    updateProfile: actions.updateProfile,
    refreshToken,
  }
}

/* Client-side route guard used by the dashboard layout. */
export function useRequireAuth(allowedRoles = null) {
  const { data, isPending } = useSession()
  const router = useRouter()

  const user = data?.user ?? null
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
