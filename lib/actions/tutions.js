/* Tuition writes — POST/PATCH/DELETE against `NEXT_PUBLIC_API_URL`.
   Every action resolves to the project-wide `{ ok, error }` shape so pages can
   `toast.error(result.error)` exactly like the store actions did.

   Auth is handled centrally by lib/api/base.js: if `token` is omitted (or
   still null because the session had not resolved yet) a Better Auth JWT is
   fetched on demand, so these calls never fail with "No token provided". */

import { post, patch, del } from "@/lib/api/base"

const withDefaults = (tuition) => ({
  isActive: true,
  approvalStatus: "pending",
  tutorName: "",
  tutorEmail: "",
  tutorPlan: "free",
  ...tuition,
})

export async function createTutions(data, token) {
  const result = await post("/tutions", data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  /* The API answers with the full document (`_id`), older builds answered
     with a bare `insertedId` — accept either. */
  const id = result.data?._id || result.data?.insertedId
  if (!id) {
    return { ok: false, error: "The tuition was saved but no id came back." }
  }
  return { ok: true, tuition: withDefaults({ ...data, _id: id }) }
}

export async function updateTutions(id, data, token) {
  const result = await patch(`/tutions/${id}`, data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, tuition: withDefaults(result.data) }
}

export async function deleteTutions(data, token) {
  const result = await del(`/tutions/${data.id}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true }
}
