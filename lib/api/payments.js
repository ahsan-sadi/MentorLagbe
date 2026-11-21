/* Payment reads — GET /api/payments (admin-only) backed by MongoDB, so the
   transaction views show real Stripe records instead of the demo store.
   Failures resolve to `{ ok: false, error }` shaped throws callers can toast. */

export const getPayments = async () => {
  const res = await fetch("/api/payments", { cache: "no-store" })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || "Could not load payments.")
  }
  return Array.isArray(data?.payments) ? data.payments : []
}
