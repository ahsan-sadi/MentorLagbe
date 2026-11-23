/* ------------------------------------------------------------------
   JWT access token for the Express API.

   (Deliberately no "use client" directive: this module is imported by
   lib/api/base.js, which is also used from server components such as
   <SubjectsStats>. It touches no React APIs and short-circuits on the
   server, so it must stay a shared module.)

   Better Auth's `jwt()` plugin (lib/auth.js) exposes the token on the
   SAME origin as the app:

       GET /api/auth/token   ->   { "token": "<jwt>" }

   Because that request is same-origin, the session cookie travels with
   it automatically — which is exactly what broke before: the old code
   asked the cross-origin Express API for a token, the browser never
   sent the host-only `better-auth.session_token` cookie there, and
   every protected call came back with "No token provided".

   This module owns one cached copy for the whole app so a hundred
   components don't each fire their own request.
------------------------------------------------------------------ */

const AUTH_BASE_PATH = (
  process.env.NEXT_PUBLIC_AUTH_BASE_PATH || "/api/auth"
).replace(/\/+$/, "")

const TOKEN_ENDPOINT = `${AUTH_BASE_PATH}/token`

/* Refresh slightly early so a request never leaves with a token that
   expires mid-flight. */
const SKEW_MS = 30_000
/* Negative cache: don't hammer the endpoint when nobody is signed in. */
const FAILURE_TTL_MS = 5_000

let cache = null // { token, exp } | null
let inflight = null
let failedAt = 0
const listeners = new Set()

function notify() {
  const value = cache?.token ?? null
  listeners.forEach((listener) => listener(value))
}

/** Decode `exp` without a JWT library (payload is only read, never trusted). */
function readExpiry(token) {
  try {
    const segment = token.split(".")[1]
    if (!segment) return null
    const b64 = segment.replace(/-/g, "+").replace(/_/g, "/")
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4)
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

async function requestToken() {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`token endpoint returned ${res.status}`)
  const data = await res.json().catch(() => null)
  const token = typeof data?.token === "string" ? data.token : ""
  if (!token) throw new Error("token endpoint returned no token")
  return token
}

/**
 * Resolve a JWT for the current session.
 * @param {{ force?: boolean }} [options] force bypasses the cache (used
 *   after a 401 so a stale token is retried once).
 * @returns {Promise<string|null>} the token, or null when signed out /
 *   the endpoint is unreachable. Never throws.
 */
export async function getToken({ force = false } = {}) {
  /* Server-side render: there is no session cookie to exchange. */
  if (typeof window === "undefined") return null

  if (!force) {
    if (cache) {
      const expired =
        cache.exp !== null && cache.exp * 1000 - SKEW_MS <= Date.now()
      if (!expired) return cache.token
      cache = null
    } else if (Date.now() - failedAt < FAILURE_TTL_MS) {
      return null
    }
  } else {
    cache = null
  }

  if (inflight) {
    const previous = await inflight
    if (!force) return previous
  }

  inflight = (async () => {
    try {
      const token = await requestToken()
      cache = { token, exp: readExpiry(token) }
      failedAt = 0
      return token
    } catch {
      cache = null
      failedAt = Date.now()
      return null
    } finally {
      inflight = null
      notify()
    }
  })()

  return inflight
}

/** Current token without triggering a request (for useSyncExternalStore). */
export function getCachedToken() {
  return cache?.token ?? null
}

/** Subscribe every `useAuth()` consumer to the one shared token. */
export function subscribeToken(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Drop the cached token (called on sign-out). */
export function clearToken() {
  cache = null
  failedAt = 0
  notify()
}

/** `Authorization` header map — returns `{}` when there is no token. */
export async function authHeader(force = false) {
  const token = await getToken({ force })
  return token ? { Authorization: `Bearer ${token}` } : {}
}
