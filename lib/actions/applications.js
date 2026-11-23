/* Application writes — POST/PATCH/DELETE against `NEXT_PUBLIC_API_URL`.
   Every action resolves to the project-wide `{ ok, error }` shape so pages can
   `toast.error(result.error)` exactly like the store actions did.

   Auth is handled centrally by lib/api/base.js: when `token` is omitted (or
   still null because the session had not resolved yet) a Better Auth JWT is
   fetched on demand, so "Apply for a tuition" never fails with
   "No token provided". */

import { post, patch, del } from "@/lib/api/base"

const withDefaults = (application) => ({
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
})

/* Student → apply for a tuition. The API links the tuition, derives the tutor
   email from it and rejects a second application (409). */
export async function createApplication(data, token) {
  const result = await post("/applications", data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, application: withDefaults(result.data) }
}

/* Tutor → accept or reject an application. */
export async function setApplicationStatus(id, status, token) {
  const result = await patch(`/applications/${id}`, { status }, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, application: withDefaults(result.data) }
}

/* Student → withdraw a pending application. */
export async function cancelApplication(id, token) {
  const result = await del(`/applications/${id}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true }
}
