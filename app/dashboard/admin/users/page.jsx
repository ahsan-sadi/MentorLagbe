"use client"

import { useMemo, useState } from "react"
import {
  GraduationCap,
  Loader2,
  Search,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import EmptyState from "@/components/shared/empty-state"
import PageHeader from "@/components/shared/page-header"
import { RoleBadge, StatusBadge } from "@/components/shared/role-badge"
import { useRequireAuth } from "@/lib/auth-context"
import { ROLES, ROLE_LABELS } from "@/lib/constants"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

/* Human labels for the raw role values (shown in the select triggers). */
const ROLE_ITEMS = Object.fromEntries(
  ROLES.map((role) => [role, ROLE_LABELS[role]])
)
const ROLE_FILTER_ITEMS = { all: "All roles", ...ROLE_ITEMS }

/* Small count pill used above the table. */
function StatChip({ icon: Icon, count, label, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3.5" />
      <span className="font-heading font-extrabold text-foreground">
        {count}
      </span>
      {label}
    </span>
  )
}

export default function AdminUsersPage() {
  const { user, ready } = useRequireAuth(["admin"])
  const { users, actions } = useStore()
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [busyId, setBusyId] = useState(null)

  const counts = useMemo(
    () => ({
      student: users.filter((u) => u.role === "student").length,
      tutor: users.filter((u) => u.role === "tutor").length,
      admin: users.filter((u) => u.role === "admin").length,
    }),
    [users]
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch =
        !needle ||
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle)
      const matchesRole = !roleFilter || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, q, roleFilter])

  const handleRoleChange = async (u, role) => {
    if (u._id === user?._id) {
      toast.info("You cannot change your own role")
      return
    }
    if (role === u.role) return
    setBusyId(u._id)
    const result = await actions.setUserRole(u._id, role)
    setBusyId(null)
    if (!result.ok) return toast.error(result.error)
    toast.success(`${u.name} is now a ${role}`)
  }

  if (!ready) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting to the admin dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="User management"
        description="Search every account on MentorLagbe and promote or demote roles. Role changes apply immediately across the dashboard."
      />

      {/* ----------------------------- filters ----------------------------- */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search by name or email…"
              className="h-10 pl-10"
              aria-label="Search users"
            />
          </div>

          <Select
            value={roleFilter || null}
            items={ROLE_FILTER_ITEMS}
            onValueChange={(value) =>
              setRoleFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger
              className="w-full lg:w-44"
              aria-label="Filter by role"
            >
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={UsersIcon}
              count={counts.student}
              label="Students"
            />
            <StatChip
              icon={GraduationCap}
              count={counts.tutor}
              label="Tutors"
            />
            <StatChip icon={ShieldCheck} count={counts.admin} label="Admins" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "user" : "users"} found
          </p>
        </div>
      </div>

      {/* ------------------------------ table ------------------------------ */}
      {filtered.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={Search}
            title="No users match those filters"
            description="Try a different name, email or role — or clear the search to see every account."
          />
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQ("")
                setRoleFilter("")
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">User</TableHead>
                <TableHead className="px-4">Role</TableHead>
                <TableHead className="px-4">Plan</TableHead>
                <TableHead className="px-4">Phone</TableHead>
                <TableHead className="px-4">Joined</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const isSelf = u._id === user?._id
                return (
                  <TableRow key={u._id}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.image}
                          alt=""
                          className="size-9 shrink-0 rounded-full border border-border bg-muted object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {u.name}
                            {isSelf && (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={u.plan} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {u.phone || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {fmtDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end">
                        <Select
                          value={u.role}
                          items={ROLE_ITEMS}
                          onValueChange={(role) => handleRoleChange(u, role)}
                          disabled={busyId === u._id}
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-32"
                            aria-label={`Change role for ${u.name}`}
                          >
                            <SelectValue />
                            {busyId === u._id && (
                              <Loader2 className="size-3.5 animate-spin" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
