/* Tuition writes — POST/PATCH/DELETE against `NEXT_PUBLIC_API_URL`.
   Every action resolves to the project-wide `{ ok, error }` shape so pages can
   `toast.error(result.error)` exactly like the store actions did. */

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tutions`

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

export async function createTutions(data) {
  const { res, body } = await request(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!res || !res.ok || !body?.insertedId) {
    return {
      ok: false,
      error: body?.error || "Could not save the tuition. Please try again.",
    }
  }
  return { ok: true, tuition: { ...data, _id: body.insertedId } }
}

export async function updateTutions(id, data) {
  const { res, body } = await request(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!res || !res.ok) {
    return {
      ok: false,
      error: body?.error || "Could not update the tuition. Please try again.",
    }
  }
  return { ok: true, tuition: body }
}

export async function deleteTutions(data) {
  const { res, body } = await request(`${API_URL}/${data.id}`, {
    method: "DELETE",
  })
  if (!res || !res.ok) {
    return {
      ok: false,
      error: body?.error || "Could not delete the tuition. Please try again.",
    }
  }
  return { ok: true }
}
