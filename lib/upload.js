/* ------------------------------------------------------------------
   Image upload helper (Challenge 3).
   Uses the ImgBB API when NEXT_PUBLIC_IMGBB_API_KEY is configured,
   otherwise falls back to a local compressed data-URL "upload" so the
   frontend works fully offline.
------------------------------------------------------------------ */

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () =>
      reject(new Error("Could not read the selected file."))
    reader.readAsDataURL(file)
  })
}

/** Downscale with a canvas so localStorage never blows past its quota. */
function compress(dataUrl, maxSize = 480, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.onerror = () =>
      reject(new Error("That file doesn't look like a valid image."))
    img.src = dataUrl
  })
}

/**
 * @param {File} file
 * @param {{ maxSize?: number, folder?: string }} options
 * @returns {Promise<{ ok: boolean, url?: string, error?: string, simulated?: boolean }>}
 */
export async function uploadImage(file, options = {}) {
  const { maxSize = 480, folder = "mentorlagbe" } = options

  if (!file) return { ok: false, error: "No file selected." }
  if (!file.type?.startsWith("image/"))
    return { ok: false, error: "Please choose an image file." }
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "Image must be under 5 MB." }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY

  if (apiKey) {
    try {
      const form = new FormData()
      form.append("image", file)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: form,
      })
      const json = await res.json()
      if (res.ok && json?.data?.url) return { ok: true, url: json.data.url }
      return {
        ok: false,
        error: json?.error?.message || "ImgBB upload failed.",
      }
    } catch {
      return { ok: false, error: "Network error while uploading to ImgBB." }
    }
  }

  /* Local simulated upload — keeps the demo fully self-contained. */
  try {
    const raw = await readAsDataUrl(file)
    const url = await compress(raw, maxSize)
    await new Promise((r) => setTimeout(r, 450))
    return { ok: true, url, simulated: true, folder }
  } catch (err) {
    return { ok: false, error: err.message || "Upload failed." }
  }
}
