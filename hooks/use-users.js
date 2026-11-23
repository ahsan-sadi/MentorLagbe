"use client"

import * as React from "react"
import { getUsers } from "@/lib/api/users"
import { useAuth } from "@/lib/auth-context"

/**
 * Every account on the platform (admin only), loaded from the API.
 *
 * Same shape as the other dashboard hooks — `{ users, hydrated, error,
 * refetch }` — so pages can swap it in for the old localStorage store
 * without touching their render code. `hydrated` flips once the first
 * request settles, letting pages show a loading state instead of a
 * table full of zeroes.
 */
export function useUsers() {
  const { token } = useAuth()
  const [users, setUsers] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getUsers(token)
        .then((list) => {
          setUsers(list)
          setError(null)
          return list
        })
        .catch((err) => {
          setError(err)
          return []
        })
        .finally(() => setHydrated(true)),
    [token]
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { users, hydrated, error, refetch }
}
