import * as React from "react"
import { getPayments } from "@/lib/api/payments"

/**
 * Real Stripe payments from MongoDB (admin-only endpoint). Same shape as the
 * other hooks: `{ payments, hydrated, error, refetch }` — `hydrated` flips
 * once the first fetch settles so pages can show skeletons instead of
 * flashing `$0` revenue.
 *
 * The fetch runs inside `.then()` callbacks so no `setState` happens
 * synchronously in the effect body.
 */
export function usePayments() {
  const [payments, setPayments] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getPayments()
        .then((list) => {
          setPayments(list)
          setError(null)
          return list
        })
        .catch((err) => {
          setError(err)
          return []
        })
        .finally(() => setHydrated(true)),
    []
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { payments, hydrated, error, refetch }
}
