/* Tuition reads — the Express API (`NEXT_PUBLIC_API_URL`) owns the data.
   Every function here is a plain GET that resolves to the JSON body. */

import { get, post, patch, del } from "./base"

/* Documents written outside the app may miss fields the UI renders (they were
   inserted with just the raw form payload). Fill the gaps from safe defaults
   instead of letting a `toLowerCase()` / `fmtDate()` blow up a whole page. */
const withDefaults = (tution) => {
  const id = String(tution?._id ?? "")
  let createdAt = tution?.createdAt
  if (!createdAt && /^[0-9a-f]{24}$/i.test(id)) {
    /* A Mongo ObjectId starts with the creation timestamp (seconds). */
    createdAt = new Date(parseInt(id.slice(0, 8), 16) * 1000).toISOString()
  }
  return {
    isActive: true,
    approvalStatus: "pending",
    tutorName: "",
    tutorEmail: "",
    tutorPlan: "free",
    ...tution,
    createdAt,
  }
}

export const getTutions = async (params = {}, token) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  const endpoint = `/tutions${queryString ? `?${queryString}` : ""}`

  const result = await get(endpoint, token)
  if (!result.ok) return { tuitions: [], pagination: null }

  // Handle both old format (array) and new format (object with tuitions + pagination)
  const data = result.data
  if (Array.isArray(data)) {
    return { tuitions: data.map(withDefaults), pagination: null }
  }

  return {
    tuitions: Array.isArray(data.tuitions) ? data.tuitions.map(withDefaults) : [],
    pagination: data.pagination || null,
  }
}

/* Count tuitions — `tutorEmail` narrows it to one tutor's listings.
   Follows the read convention: resolves to the JSON body, and reports
   failures as `{ ok: false, error }` so callers can `toast.error(...)`. */
export const getTutionsCount = async (tutorEmail, token) => {
  const query = tutorEmail
    ? `?tutorEmail=${encodeURIComponent(tutorEmail)}`
    : ""
  const result = await get(`/tutions/count${query}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, count: result.data.count }
}

/* Get category stats — count of approved active tuitions per subject */
export const getCategoriesStats = async (token) => {
  const result = await get("/tutions/categories", token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, categories: result.data }
}

export const getTution = async (id, token) => {
  if (!id) return null
  const result = await get(`/tutions/${id}`, token)
  if (!result.ok) return null
  return result.data ? withDefaults(result.data) : null
}

/* Create tuition (requires tutor auth) */
export const createTuition = async (data, token) => {
  const result = await post("/tutions", data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, tuition: withDefaults(result.data) }
}

/* Update tuition (requires tutor/admin auth) */
export const updateTuition = async (id, data, token) => {
  const result = await patch(`/tutions/${id}`, data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, tuition: withDefaults(result.data) }
}

/* Delete tuition (requires tutor/admin auth) */
export const deleteTuition = async (id, token) => {
  const result = await del(`/tutions/${id}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, result: result.data }
}