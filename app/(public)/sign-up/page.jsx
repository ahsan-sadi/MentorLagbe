"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Loader2,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, dashboardHome } from "@/lib/auth-context"
import { ROLE_LABELS, ROLES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Sign-up is open to Students and Tutors (admin accounts are seeded only). */
const SIGNUP_ROLES = ROLES.filter((role) => role !== "admin")

const ROLE_CARDS = {
  student: {
    icon: GraduationCap,
    blurb: "Find tutors and apply to tuition batches",
  },
  tutor: {
    icon: BookOpen,
    blurb: "Post tuition batches and hire students",
  },
}

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, refreshToken } = useAuth()

  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [role, setRole] = useState("")
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const pickRole = (value) => {
    setRole(value)
    setErrors((prev) => ({ ...prev, role: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Full name is required."
    if (!form.email.trim()) next.email = "Email is required."
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = "Enter a valid email address."
    if (!form.password) next.password = "Password is required."
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters."
    if (!role)
      next.role = "Please choose whether you are joining as a Student or Tutor."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)
    const { data, error } = await authClient.signUp.email({
      email: form.email.trim(),
      password: form.password,
      name: form.name.trim(),
      role: role,
    })
    console.log("signUp result:", { data, error })
    setPending(false)
    if (!data) {
      toast.error(error)
      return
    }
    
    // Store JWT token from BetterAuth response
    if (data.token) {
      localStorage.setItem("mentorlagbe_jwt", data.token)
    }
    
    toast.success(`Account created — welcome, ${data.user.name.split(" ")[0]}!`)
    // Fetch JWT token for backend API
    await refreshToken()
    router.push(dashboardHome(data.user.role || role))
    router.refresh() // pick up the fresh session in the navbar
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="eyebrow">Get started</p>
          <h1 className="section-title mt-3 text-3xl sm:text-4xl">
            Create an account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Join as a Student to find your ideal tutor, or as a Tutor to fill
            your batch — it takes less than a minute.
          </p>
        </div>

        <Card className="rounded-2xl border border-border">
          <CardHeader>
            <CardTitle className="font-heading">Sign up for free</CardTitle>
            <CardDescription>
              Every account starts on the Free plan — no card required.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">Full name</Label>
                <Input
                  id="signup-name"
                  autoComplete="name"
                  placeholder="e.g. Sadia Rahman"
                  value={form.name}
                  onChange={setField("name")}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={setField("email")}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signup-password">Password</Label>
                  <span className="text-xs text-muted-foreground">
                    Min. 6 characters
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••"
                    className="pr-10"
                    value={form.password}
                    onChange={setField("password")}
                    aria-invalid={Boolean(errors.password)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1.5 -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* -------------------------- role picker -------------------------- */}
              <div className="space-y-1.5">
                <Label>I am joining as a…</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SIGNUP_ROLES.map((value) => {
                    const card = ROLE_CARDS[value]
                    const Icon = card.icon
                    const selected = role === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => pickRole(value)}
                        aria-pressed={selected}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border bg-background hover:border-primary/40"
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg",
                              selected
                                ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Icon className="size-4.5" />
                          </span>
                          <span
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full border",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input"
                            )}
                          >
                            {selected && (
                              <span className="size-2 rounded-full bg-current" />
                            )}
                          </span>
                        </span>
                        <span className="mt-3 block font-heading text-sm font-semibold text-foreground">
                          {ROLE_LABELS[value]}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {card.blurb}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Creating
                    account…
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" /> Create account
                  </>
                )}
              </Button>

              <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                Your account is stored locally in this demo — BetterAuth is
                mocked, so no data leaves your browser.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
