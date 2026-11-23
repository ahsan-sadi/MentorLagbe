import { createAuthClient } from "better-auth/react"
import { getToken } from "./auth-token"

/* `baseURL` intentionally falls back to `undefined`: Better Auth then resolves
   it from `BETTER_AUTH_URL` on the server and from `window.location.origin` in
   the browser, so a stale `BETTER_AUTH_URL=http://localhost:3000` copied into
   Vercel can never point the client at localhost. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined,
})

export const { signIn, signUp, signOut, useSession } = authClient

/**
 * The Better Auth JWT for the current session (`GET /api/auth/token`).
 * Returns null when signed out — never throws.
 */
export async function getJWTToken() {
  return getToken()
}

/** Sign the user out on every device. */
export async function signOutEverywhere() {
  try {
    await authClient.revokeSessions()
  } catch {
    /* best effort — continue with the local sign-out */
  }
  return authClient.signOut()
}
