import * as React from "react"
import { getTution, getTutions } from "@/lib/api/tutions"

/**
 * Tuition list from the API. Keeps the `{ tuitions, hydrated }` shape the pages
 * already used with `useStore()`, so only the import changes — plus `refetch()`
 * to re-read after a write (mutations don't live in React state anymore).
 *
 * The fetch runs inside `.then()` callbacks so no `setState` happens
 * synchronously in the effect body.
 */
export function useTutions() {
  const [tuitions, setTuitions] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getTutions()
        .then((list) => {
          setTuitions(list)
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

  return { tuitions, hydrated, error, refetch }
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
