"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, LogIn, Sparkles, UserRound } from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import { useAuth, dashboardHome } from "@/lib/auth-context"
import { DEMO_ACCOUNTS, ROLE_LABELS } from "@/lib/constants"
import { authClient } from "@/lib/auth-client"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignInPage() {
  const router = useRouter()
  const { refreshToken } = useAuth()

  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = "Email is required."
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = "Enter a valid email address."
    if (!form.password) next.password = "Password is required."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true)
    const { data, error } = await authClient.signIn.email({
      email: form.email.trim(),
      password: form.password,
    })

    console.log("signIn result:", { data, error })

    setPending(false)
    if (!data) {
      toast.error(error)
      return
    }
    
    // Store JWT token from BetterAuth response
    if (data.token) {
      localStorage.setItem("mentorlagbe_jwt", data.token)
    }
    
    toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`)
    // Fetch JWT token for backend API
    await refreshToken()
    router.push(dashboardHome(data.user.role))
    router.refresh()
  }

  const useDemo = (account) => {
    setForm({ email: account.email, password: account.password })
    setErrors({})
    toast.info(`Filled in ${account.email}`)
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="eyebrow">Welcome back</p>
          <h1 className="section-title mt-3 text-3xl sm:text-4xl">Sign in</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Pick up where you left off — manage your tuitions, applications and
            plan from one dashboard.
          </p>
        </div>

        <Card className="rounded-2xl border border-border">
          <CardHeader>
            <CardTitle className="font-heading">
              Sign in to your account
            </CardTitle>
            <CardDescription>
              Use your email and password, or grab a demo account below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
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
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" /> Sign in
                  </>
                )}
              </Button>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() =>
                  toast.info("Google sign-in is not enabled in this demo")
                }
              >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.53-.2-2.25H12v4.26h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.54-5.17 3.54-8.66Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.02c-1.07.72-2.45 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A11.99 11.99 0 0 0 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.25a7.2 7.2 0 0 1 0-4.5V6.66H1.28a12 12 0 0 0 0 10.68l3.99-3.09Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.28 6.66l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --------------------------- demo accounts --------------------------- */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="flex items-center gap-2 font-heading text-sm font-semibold">
            <Sparkles className="size-4 text-primary" /> Demo accounts
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            One click fills the form — every demo password is{" "}
            <span className="font-semibold text-foreground">123456</span>.
          </p>
          <ul className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <li
                key={account.email}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {account.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[account.role]} · {account.password}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => useDemo(account)}
                >
                  <UserRound className="size-3.5" /> Use
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to MentorLagbe?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  )
}