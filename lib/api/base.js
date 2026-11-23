/* Base API configuration.

   Every request automatically attaches a Better Auth JWT (see
   lib/auth-token.js) when the caller didn't hand one over, and retries
   exactly once with a freshly minted token after a 401. That is what
   makes "Apply for a tuition" / "Submit for approval" work regardless of
   whether the component remembered to pass `token` down. */

import { getToken } from "../auth-token"

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_API_URL || ""
const API_BASE = String(RAW_BASE).replace(/\/+$/, "")

async function once(endpoint, options, token) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  })

  const data = await res.json().catch(() => ({}))
  return { res, data }
}

async function apiFetch(endpoint, options = {}, token) {
  if (!API_BASE) {
    return {
      ok: false,
      error:
        "NEXT_PUBLIC_API_URL is not set — the API base URL is missing from the environment.",
    }
  }

  /* An explicitly supplied token is trusted as-is; otherwise resolve one
     from the session (returns null for anonymous callers, which is fine
     for the public endpoints). */
  const supplied = typeof token === "string" && token.length > 0
  let authToken = supplied ? token : await getToken()

  let out = await once(endpoint, options, authToken)

  /* Stale or expired JWT → mint a new one and try a single time. */
  if (out.res.status === 401 && !supplied && authToken) {
    const fresh = await getToken({ force: true })
    if (fresh && fresh !== authToken) {
      out = await once(endpoint, options, fresh)
    }
  }

  if (!out.res.ok) {
    return {
      ok: false,
      error: out.data?.error || `Request failed: ${out.res.status}`,
      status: out.res.status,
    }
  }

  return { ok: true, data: out.data }
}

export async function get(endpoint, token) {
  return apiFetch(endpoint, { method: "GET" }, token)
}

export async function post(endpoint, body, token) {
  return apiFetch(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token
  )
}

export async function patch(endpoint, body, token) {
  return apiFetch(
    endpoint,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    token
  )
}

export async function del(endpoint, token) {
  return apiFetch(endpoint, { method: "DELETE" }, token)
}
