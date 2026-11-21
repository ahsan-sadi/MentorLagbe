/* Application writes — POST/PATCH/DELETE against `NEXT_PUBLIC_API_URL`.
   Every action resolves to the project-wide `{ ok, error }` shape so pages can
   `toast.error(result.error)` exactly like the store actions did. */

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/applications`

const request = async (url, options) => {
  try {
    const res = await fetch(url, options)
    const body = await res.json().catch(() => null)
    return { res, body }
  } catch {
    /* fetch itself failed — the API isn't reachable */
    return { res: null, body: null }
  }
}

/* Student → apply for a tuition. The API links the tuition, derives the tutor
   email from it and rejects a second application (409). */
export async function createApplication(data) {
  const { res, body } = await request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!res || !res.ok) {
    return {
      ok: false,
      error: body?.error || "Could not submit your application. Please try again.",
    }
  }
  return { ok: true, application: body }
}

/* Tutor → accept or reject an application. */
export async function setApplicationStatus(id, status) {
  const { res, body } = await request(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })
  if (!res || !res.ok) {
    return {
      ok: false,
      error: body?.error || "Could not update the application. Please try again.",
    }
  }
  return { ok: true, application: body }
}

/* Student → withdraw a pending application. */
export async function cancelApplication(id) {
  const { res, body } = await request(`${API_URL}/${id}`, {
    method: "DELETE",
  })
  if (!res || !res.ok) {
    return {
      ok: false,
      error: body?.error || "Could not cancel the application. Please try again.",
    }
  }
  return { ok: true }
}
