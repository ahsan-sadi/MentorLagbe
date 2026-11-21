/* Tuition reads — the Express API (`NEXT_PUBLIC_API_URL`) owns the data.
   Every function here is a plain GET that resolves to the JSON body. */

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

export const getTutions = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutions`, {
    method: "GET",
  })
  const tutions = await res.json()
  return Array.isArray(tutions) ? tutions.map(withDefaults) : []
}

/* Count tuitions — `tutorEmail` narrows it to one tutor's listings.
   Follows the read convention: resolves to the JSON body, and reports
   failures as `{ ok: false, error }` so callers can `toast.error(...)`. */
export const getTutionsCount = async (tutorEmail) => {
  const query = tutorEmail
    ? `?tutorEmail=${encodeURIComponent(tutorEmail)}`
    : ""
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tutions/count${query}`,
      {
        method: "GET",
      }
    )
    const body = await res.json().catch(() => null)
    if (!res.ok || typeof body?.count !== "number") {
      return {
        ok: false,
        error: body?.error || "Could not read the tuition count.",
      }
    }
    return { ok: true, count: body.count }
  } catch {
    /* fetch itself failed — the API isn't reachable */
    return { ok: false, error: "Could not reach the server. Try again." }
  }
}

export const getTution = async (id) => {
  if (!id) return null
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutions/${id}`, {
    method: "GET",
  })
  if (!res.ok) return null
  const tution = await res.json()
  return tution ? withDefaults(tution) : null
}
