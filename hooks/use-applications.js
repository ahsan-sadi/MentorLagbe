"use client"

import * as React from "react"
import { getApplications, getMyApplications } from "@/lib/api/applications"
import { useAuth } from "@/lib/auth-context"

/**
 * Applications from the API for current user.
 */
export function useApplications() {
  const { token } = useAuth()
  const [applications, setApplications] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getMyApplications(token)
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
    [token]
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { applications, hydrated, error, refetch }
}

/**
 * All applications (admin only)
 */
export function useAllApplications() {
  const { token } = useAuth()
  const [applications, setApplications] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getApplications(token)
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
    [token]
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { applications, hydrated, error, refetch }
}