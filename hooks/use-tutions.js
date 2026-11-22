import * as React from "react"
import { getTution, getTutions } from "@/lib/api/tutions"

/**
 * Tuition list from the API with server-side search, filter, and pagination.
 * Accepts params object for server-side querying.
 */
export function useTutions(params = {}) {
  const [tuitions, setTuitions] = React.useState([])
  const [pagination, setPagination] = React.useState(null)
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getTutions(params)
        .then((data) => {
          setTuitions(data.tuitions)
          setPagination(data.pagination)
          setError(null)
          return data
        })
        .catch((err) => {
          setError(err)
          return { tuitions: [], pagination: null }
        })
        .finally(() => setHydrated(true)),
    [params]
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { tuitions, pagination, hydrated, error, refetch }
}

/**
 * Single tuition by id (detail page) — `null` while loading or when missing.
 * The result is tagged with the id it was fetched for, so a changed id reads as
 * "loading" again without a synchronous setState in the effect.
 */
export function useTution(id) {
  const [state, setState] = React.useState({ id: null, tuition: null })

  React.useEffect(() => {
    let cancelled = false
    getTution(id)
      .then((tuition) => !cancelled && setState({ id, tuition }))
      .catch(() => !cancelled && setState({ id, tuition: null }))
    return () => {
      cancelled = true
    }
  }, [id])

  const current = state.id === id
  return {
    tuition: current ? state.tuition : null,
    hydrated: current,
  }
}