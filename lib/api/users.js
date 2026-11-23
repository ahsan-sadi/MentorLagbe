/* User reads/writes for the admin dashboard — `GET /users` and
   `PATCH /users/:id` on the Express API (`NEXT_PUBLIC_API_URL`).
   The API never returns the `password` field. */

import { get, patch } from "./base"

const withDefaults = (u) => ({
  _id: "",
  name: "",
  email: "",
  role: "student",
  plan: "free",
  phone: "",
  bio: "",
  image: "",
  createdAt: "",
  ...u,
})

/* Every account, newest first. Resolves to an array (empty on failure) so it
   drops straight into the same hook shape as `getApplications`. */
export const getUsers = async (token) => {
  const result = await get("/users", token)
  if (!result.ok) return []
  return Array.isArray(result.data) ? result.data.map(withDefaults) : []
}

/* Admin changes a user's role and/or plan. */
export const updateUser = async (id, data, token) => {
  const result = await patch(`/users/${id}`, data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, user: withDefaults(result.data) }
}
