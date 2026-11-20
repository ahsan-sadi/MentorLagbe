"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Info, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import ImageUpload from "@/components/shared/image-upload"
import PageHeader from "@/components/shared/page-header"
import { RoleBadge } from "@/components/shared/role-badge"
import { useRequireAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ProfilePage() {
  const { user, ready } = useRequireAuth()
  const router = useRouter()
  const { actions } = useStore()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    image: "",
  })
  const [syncedFrom, setSyncedFrom] = useState(null)
  const [pending, setPending] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  /* seed the form once per signed-in account (and again after a demo reset) */
  useEffect(() => {
    if (!ready || !user || syncedFrom === user._id) return
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || "",
      image: user.image || "",
    })
    setSyncedFrom(user._id)
  }, [ready, user, syncedFrom])

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim()

    if (!name) {
      toast.error("Please enter your full name")
      return
    }
    if (!EMAIL_RE.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setPending(true)
    const result = await actions.updateProfile({
      name,
      email,
      phone: form.phone.trim(),
      bio: form.bio,
      image: form.image.trim(),
    })
    setPending(false)

    if (!result.ok) return toast.error(result.error)
    toast.success("Profile updated")
  }

  const handleReset = async () => {
    setResetting(true)
    const result = await actions.resetDemo()
    setResetting(false)
    setResetOpen(false)
    if (!result.ok) return toast.error(result.error)
    setSyncedFrom(null)
    toast.success("Demo data restored")
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
              Your email is used to sign in — make sure it stays accurate.
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
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className="h-10"
                  autoComplete="email"
                />
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

          {/* --------------------------- reset demo --------------------------- */}
          <Card className="rounded-2xl border border-border">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Demo data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Restore the original seed users, tuitions, applications and
                payments. This wipes every local change made during this demo.
              </p>
              <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={resetting}
                  onClick={() => setResetOpen(true)}
                >
                  {resetting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Reset demo data
                </Button>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Every tuition, application, payment and profile edit you
                      made will be replaced with the original seed data. You
                      will be signed out.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={resetting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={resetting}
                      onClick={handleReset}
                    >
                      {resetting ? "Resetting…" : "Yes, reset data"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
