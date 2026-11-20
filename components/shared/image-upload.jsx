"use client"

/* Direct image upload (Challenge 3) — ImgBB when an API key is present,
   otherwise a locally compressed data-URL so the demo works offline. */

import { useRef, useState } from "react"
import { toast } from "sonner"
import { ImagePlus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadImage } from "@/lib/upload"

export function ImageUpload({
  label = "Image",
  value,
  onChange,
  maxSize = 480,
  className,
  rounded = "rounded-xl",
  hint = "JPG or PNG · max 5 MB",
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setBusy(true)
    const result = await uploadImage(file, { maxSize })
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error || "Upload failed")
      return
    }
    onChange(result.url)
    toast.success(
      result.simulated
        ? "Image uploaded (local preview)"
        : "Image uploaded to ImgBB"
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative flex size-24 shrink-0 items-center justify-center overflow-hidden border border-dashed border-border bg-muted",
            rounded
          )}
        >
          {value ? (
            <img src={value} alt={label} className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {value ? "Replace image" : `Upload ${label.toLowerCase()}`}
          </Button>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          aria-label={`Choose ${label}`}
        />
      </div>
    </div>
  )
}

export default ImageUpload
