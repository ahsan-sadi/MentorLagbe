import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
})

export const { signIn, signUp, signOut, useSession } = authClient

/**
 * Get the JWT token from BetterAuth session.
 * When JWT is enabled in BetterAuth config, the token is available after sign-in.
 * This fetches the current session and extracts the token if available.
 */
export async function getJWTToken() {
  try {
    const session = await authClient.getSession()
    return session.data?.token || null
  } catch {
    return null
  }
}

/**
 * Sign the user out on every device.
 */
export async function signOutEverywhere() {
  const revoked = await authClient.revokeSessions()
  await authClient.signOut()
  return revoked
}