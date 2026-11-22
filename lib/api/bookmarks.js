/* Bookmark API calls */

import { get, post, del } from "./base"

export const getBookmarks = async (token) => {
  const result = await get("/bookmarks", token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, bookmarks: result.data }
}

export const addBookmark = async (tuitionId, token) => {
  const result = await post("/bookmarks", { tuitionId }, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, bookmark: result.data }
}

export const removeBookmark = async (tuitionId, token) => {
  const result = await del(`/bookmarks/${tuitionId}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true }
}

export const checkBookmark = async (tuitionId, token) => {
  const result = await get(`/bookmarks/check/${tuitionId}`, token)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  return { ok: true, bookmarked: result.data.bookmarked }
}