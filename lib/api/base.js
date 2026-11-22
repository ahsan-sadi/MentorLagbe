/* Base API configuration */

const API_BASE = process.env.NEXT_PUBLIC_API_URL

async function apiFetch(endpoint, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { ok: false, error: data?.error || `Request failed: ${res.status}` }
  }

  return { ok: true, data }
}

export async function get(endpoint, token) {
  return apiFetch(endpoint, { method: "GET" }, token)
}

export async function post(endpoint, body, token) {
  return apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  }, token)
}

export async function patch(endpoint, body, token) {
  return apiFetch(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  }, token)
}

export async function del(endpoint, token) {
  return apiFetch(endpoint, { method: "DELETE" }, token)
}