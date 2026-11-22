"use client"

import * as React from "react"
import { getBookmarks, addBookmark, removeBookmark, checkBookmark } from "@/lib/api/bookmarks"
import { useAuth } from "@/lib/auth-context"

/**
 * Bookmarks for the current student.
 */
export function useBookmarks() {
  const { token } = useAuth()
  const [bookmarks, setBookmarks] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () =>
      getBookmarks(token)
        .then((result) => {
          if (result.ok) {
            setBookmarks(result.bookmarks)
            setError(null)
          } else {
            setError(result.error)
          }
          return result
        })
        .catch((err) => {
          setError(err)
          return { ok: false }
        })
        .finally(() => setHydrated(true)),
    [token]
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  const add = React.useCallback(
    async (tuitionId) => {
      const result = await addBookmark(tuitionId, token)
      if (result.ok) {
        setBookmarks((prev) => [...prev, result.bookmark])
      }
      return result
    },
    [token]
  )

  const remove = React.useCallback(
    async (tuitionId) => {
      const result = await removeBookmark(tuitionId, token)
      if (result.ok) {
        setBookmarks((prev) => prev.filter((b) => b.tuitionId !== tuitionId))
      }
      return result
    },
    [token]
  )

  const check = React.useCallback(
    async (tuitionId) => {
      return checkBookmark(tuitionId, token)
    },
    [token]
  )

  const isBookmarked = React.useCallback(
    (tuitionId) => bookmarks.some((b) => b.tuitionId === tuitionId),
    [bookmarks]
  )

  return { bookmarks, hydrated, error, refetch, add, remove, check, isBookmarked }
}