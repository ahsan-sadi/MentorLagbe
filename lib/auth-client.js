import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
})

export const { signIn, signUp, signOut, useSession } = authClient

/**
 * Sign the user out on every device.
 *
 * `revokeSessions()` calls POST /revoke-sessions, which deletes every session
 * the user owns in the database (this device's cookie included). `signOut()`
 * then runs so the client-side session atom resets and the logout is
 * broadcast to the user's other open tabs.
 */
export async function signOutEverywhere() {
  const revoked = await authClient.revokeSessions()
  await authClient.signOut()
  return revoked
}
