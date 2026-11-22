/* Reviews/Ratings API calls */

import { get, post, patch, del } from "./base"

export const getReviews = async (tuitionId, token) => {
  const result = await get(`/reviews/tuition/${tuitionId}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, ...result.data }
}

export const createReview = async (data, token) => {
  const result = await post("/reviews", data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, review: result.data }
}

export const updateReview = async (id, data, token) => {
  const result = await patch(`/reviews/${id}`, data, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, review: result.data }
}

export const deleteReview = async (id, token) => {
  const result = await del(`/reviews/${id}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true }
}