import * as React from "react"
import { getApplications } from "@/lib/api/applications"

/**
 * Applications from the API. Keeps the `{ applications, hydrated }` shape the
 * pages already used with `useStore()`, so only the import changes — plus
 * `refetch()` to re-read after a write (mutations don't live in React state).
 *
 * The fetch runs inside `.then()` callbacks so no `setState` happens
 * synchronously in the effect body.
 */
export function useApplications() {
  const [applications, setApplications] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getApplications()
        .then((list) => {
          setApplications(list)
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

  return { applications, hydrated, error, refetch }
}
