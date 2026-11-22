"use client"

/* Thin auth layer over BetterAuth session — provides user, JWT token, and auth actions.
   BetterAuth handles JWT natively when `jwt: { enabled: true }` is configured.
   JWT token is stored in localStorage after sign-in/sign-up. */

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useStore } from "./store"
import { useSession } from "./auth-client"

const JWT_STORAGE_KEY = "mentorlagbe_jwt"

export function useAuth() {
  const { data, isPending } = useSession()
  const { actions } = useStore()
  const user = data?.user ?? null
  const [token, setToken] = useState(null)

  // Load JWT token from localStorage
  const loadToken = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(JWT_STORAGE_KEY)
      if (stored) {
        setToken(stored)
      }
    }
  }, [])

  // Clear token on sign-out
  const clearToken = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(JWT_STORAGE_KEY)
      setToken(null)
    }
  }, [])

  useEffect(() => {
    loadToken()
  }, [loadToken])

  return {
    user,
    token,
    hydrated: !isPending,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    signIn: actions.signIn,
    signUp: actions.signUp,
    signOut: () => {
      clearToken()
      return actions.signOut()
    },
    updateProfile: actions.updateProfile,
    refreshToken: loadToken,
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