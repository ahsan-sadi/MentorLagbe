/* Application reads — the Express API (`NEXT_PUBLIC_API_URL`) owns the data.
   Every function here is a plain GET that resolves to the JSON body. */

import { get, post, patch, del } from "./base"

/* Documents written outside the app may miss fields the UI renders; fill the
   gaps from safe defaults instead of letting a `toLowerCase()` / `fmtDate()`
   blow up a whole page. */
const withDefaults = (application) => {
  const id = String(application?._id ?? "")
  let appliedAt = application?.appliedAt
  if (!appliedAt && /^[0-9a-f]{24}$/i.test(id)) {
    /* A Mongo ObjectId starts with the creation timestamp (seconds). */
    appliedAt = new Date(parseInt(id.slice(0, 8), 16) * 1000).toISOString()
  }
  return {
    status: "pending",
    tutorEmail: "",
    tuitionTitle: "",
    subject: "",
    monthlyFee: 0,
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    preferredSchedule: "",
    studentNote: "",
    ...application,
    appliedAt,
  }
}

export const getApplications = async (token) => {
  const result = await get("/applications", token)
  if (!result.ok) return []
  return Array.isArray(result.data) ? result.data.map(withDefaults) : []
}

export const getMyApplications = async (token) => {
  const result = await get("/applications/my", token)
  if (!result.ok) return []
  return Array.isArray(result.data) ? result.data.map(withDefaults) : []
}

export const getApplication = async (id, token) => {
  if (!id) return null
  const result = await get(`/applications/${id}`, token)
  if (!result.ok) return null
  return result.data ? withDefaults(result.data) : null
}

export const createApplication = async (data, token) => {
  const result = await post("/applications", data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, application: withDefaults(result.data) }
}

export const updateApplication = async (id, data, token) => {
  const result = await patch(`/applications/${id}`, data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, application: withDefaults(result.data) }
}

export const deleteApplication = async (id, token) => {
  const result = await del(`/applications/${id}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true }
}