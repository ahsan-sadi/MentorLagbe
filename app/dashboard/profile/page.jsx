"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Info, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import ImageUpload from "@/components/shared/image-upload"
import PageHeader from "@/components/shared/page-header"
import { RoleBadge } from "@/components/shared/role-badge"
import { useRequireAuth } from "@/lib/auth-context"
import { authClient } from "@/lib/auth-client"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export default function ProfilePage() {
  const { user, ready } = useRequireAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    image: "",
  })
  const [syncedFrom, setSyncedFrom] = useState(null)
  const [pending, setPending] = useState(false)

  /* seed the form once per signed-in account */
  useEffect(() => {
    if (!ready || !user || syncedFrom === user.id) return
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || "",
      image: user.image || "",
    })
    setSyncedFrom(user.id)
  }, [ready, user, syncedFrom])

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const name = form.name.trim()

    if (!name) {
      toast.error("Please enter your full name")
      return
    }

    setPending(true)
    /* Persist to Better Auth / MongoDB — `email` is deliberately not sent:
       the endpoint rejects it, and every tuition and application on the
       platform is keyed by it, so changing it would orphan your listings. */
    const { error } = await authClient.updateUser({
      name,
      phone: form.phone.trim(),
      bio: form.bio,
      image: form.image.trim(),
    })
    setPending(false)

    if (error) return toast.error(error.message || "Could not save your profile")
    setSyncedFrom(user.id)
    toast.success("Profile updated")
    router.refresh()
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Opening your profile…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Update your profile"
        description="Keep your name, contact details and photo up to date — students and tutors see this information across the marketplace."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ------------------------------ form ------------------------------ */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card lg:col-span-2"
        >
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              Profile details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your email is your sign-in identity and stays fixed — name,
              contact details and photo can be updated below.
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="e.g. Tanvir Ahmed"
                  className="h-10"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  readOnly
                  disabled
                  placeholder="you@example.com"
                  className="h-10"
                  autoComplete="email"
                />
                <p className="text-xs text-muted-foreground">
                  Your sign-in email — every tuition and application is linked
                  to it, so it can&apos;t be changed here.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={form.phone}
                onChange={update("phone")}
                placeholder="+880 1XXX-XXXXXX"
                className="h-10"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-bio">Bio</Label>
              <Textarea
                id="profile-bio"
                value={form.bio}
                onChange={update("bio")}
                rows={4}
                placeholder="A short introduction — what you teach or what you're looking for…"
              />
            </div>

            <div className="space-y-2">
              <Label>Profile picture</Label>
              <ImageUpload
                label="Profile picture"
                value={form.image}
                onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
                rounded="rounded-full"
              />
              <div className="space-y-1.5 pt-1">
                <Label
                  htmlFor="profile-image-url"
                  className="text-xs text-muted-foreground"
                >
                  …or paste an image URL
                </Label>
                <Input
                  id="profile-image-url"
                  value={form.image}
                  onChange={update("image")}
                  placeholder="https://api.dicebear.com/9.x/notionists/svg?seed=you"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-border px-5 py-4">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>

        {/* ----------------------------- side card ---------------------------- */}
        <aside className="space-y-6">
          <Card className="rounded-2xl border border-border">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-20 shrink-0 rounded-full border border-border bg-muted object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-extrabold tracking-tight text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-2">
                    <RoleBadge role={user.role} plan={user.plan} />
                  </div>
                </div>
              </div>

              <Separator />

              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" />
                Member since{" "}
                <span className="font-medium text-foreground">
                  {fmtDate(user.createdAt)}
                </span>
              </p>

              <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" />
                Your role (Student, Tutor or Admin) is managed by the admin team
                — role changes requested here won't apply until an admin updates
                them.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
