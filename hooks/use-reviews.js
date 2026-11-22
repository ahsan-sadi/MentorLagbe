"use client"

import * as React from "react"
import { getReviews, createReview, updateReview, deleteReview } from "@/lib/api/reviews"
import { useAuth } from "@/lib/auth-context"

/**
 * Reviews for a specific tuition.
 */
export function useReviews(tuitionId) {
  const { token } = useAuth()
  const [reviews, setReviews] = React.useState([])
  const [stats, setStats] = React.useState({ average: 0, count: 0 })
  const [hydrated, setHydrated] = React.useState(false)
  const [error, setError] = React.useState(null)

  const refetch = React.useCallback(
    () => {
      if (!tuitionId) return
      getReviews(tuitionId, token)
        .then((result) => {
          if (result.ok) {
            setReviews(result.reviews)
            setStats(result.stats)
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
        .finally(() => setHydrated(true))
    },
    [tuitionId, token]
  )

  React.useEffect(() => {
    refetch()
  }, [refetch])

  const add = React.useCallback(
    async (data) => {
      const result = await createReview(data, token)
      if (result.ok) {
        setReviews((prev) => [result.review, ...prev])
        // Update stats
        const newCount = stats.count + 1
        const newAvg = (stats.average * stats.count + data.rating) / newCount
        setStats({ average: Math.round(newAvg * 10) / 10, count: newCount })
      }
      return result
    },
    [stats, token]
  )

  const update = React.useCallback(
    async (id, data) => {
      const result = await updateReview(id, data, token)
      if (result.ok) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? result.review : r))
        )
        // Recalculate stats
        const newReviews = reviews.map((r) =>
          r._id === id ? result.review : r
        )
        const avg =
          newReviews.length > 0
            ? newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length
            : 0
        setStats({ average: Math.round(avg * 10) / 10, count: newReviews.length })
      }
      return result
    },
    [reviews, token]
  )

  const remove = React.useCallback(
    async (id) => {
      const result = await deleteReview(id, token)
      if (result.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== id))
        // Recalculate stats
        const newReviews = reviews.filter((r) => r._id !== id)
        const avg =
          newReviews.length > 0
            ? newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length
            : 0
        setStats({ average: Math.round(avg * 10) / 10, count: newReviews.length })
      }
      return result
    },
    [reviews, token]
  )

  const hasReviewed = React.useCallback(
    (studentEmail) => reviews.some((r) => r.studentEmail === studentEmail),
    [reviews]
  )

  return { reviews, stats, hydrated, error, refetch, add, update, remove, hasReviewed }
}