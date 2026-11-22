"use client"

import { useSession } from "./auth-client"

/**
 * Hook to get the access token for API calls.
 * With better-auth, the session cookie is used for same-origin requests,
 * but for cross-origin API calls we need the JWT token.
 */
export function useAuthToken() {
  const { data } = useSession()
  const user = data?.user

  // For now, return null since better-auth uses cookies
  // In production with separate backend, you'd need to implement token exchange
  // or use the session cookie with credentials: "include"
  return user ? "session-cookie" : null
}

/**
 * Get the authorization header for API calls
 */
export function getAuthHeader() {
  // With better-auth, cookies are sent automatically for same-origin
  // For cross-origin, you'd need to implement token exchange
  return {}
}

/**
 * Fetch wrapper that includes auth credentials
 */
export async function authenticatedFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    credentials: "include", // Send cookies with cross-origin requests
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
}