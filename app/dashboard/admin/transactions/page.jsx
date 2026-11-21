"use client"

import { useMemo } from "react"
import {
  CircleDollarSign,
  GraduationCap,
  Loader2,
  Receipt,
  TriangleAlert,
  Users,
} from "lucide-react"

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
import StatCard from "@/components/shared/stat-card"
import { RoleBadge } from "@/components/shared/role-badge"
import { useRequireAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { usePayments } from "@/hooks/use-payments"

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export default function AdminTransactionsPage() {
  const { ready } = useRequireAuth(["admin"])
  const { users } = useStore()
  /* Real Stripe records from MongoDB — not the demo store. */
  const { payments, hydrated, error } = usePayments()

  const revenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const paidCount = payments.filter((p) => p.paymentStatus === "paid").length
  const proTutors = users.filter(
    (u) => u.role === "tutor" && u.plan === "pro"
  ).length
  const proStudents = users.filter(
    (u) => u.role === "student" && u.plan === "pro"
  ).length

  const sorted = useMemo(
    () => [...payments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)),
    [payments]
  )

  if (!ready) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting to the admin dashboard…
      </div>
    )
  }

  /* first fetch still in flight — never flash "$0 revenue" */
  if (!hydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin"
          title="Transactions"
          description="Every Stripe payment made on MentorLagbe, newest first — plan upgrades from tutors and students in one place."
        />
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading transactions…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin"
          title="Transactions"
          description="Every Stripe payment made on MentorLagbe, newest first — plan upgrades from tutors and students in one place."
        />
        <EmptyState
          icon={TriangleAlert}
          title="Could not load payments"
          description={error.message}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Transactions"
        description="Every Stripe payment made on MentorLagbe, newest first — plan upgrades from tutors and students in one place."
      />

      {/* ------------------------------ stats ------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${revenue}`}
          sublabel="lifetime Stripe earnings"
          icon={CircleDollarSign}
          tone="emerald"
        />
        <StatCard
          label="Successful Payments"
          value={paidCount}
          sublabel="all marked as paid"
          icon={Receipt}
          tone="primary"
        />
        <StatCard
          label="Pro Tutors"
          value={proTutors}
          sublabel="tutors on the Pro plan"
          icon={GraduationCap}
          tone="violet"
        />
        <StatCard
          label="Pro Students"
          value={proStudents}
          sublabel="students on the Pro plan"
          icon={Users}
          tone="sky"
        />
      </div>

      {/* ------------------------------ table ------------------------------ */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="When tutors or students upgrade to a Pro plan, their payments will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">User Name</TableHead>
                <TableHead className="px-4">Email</TableHead>
                <TableHead className="px-4">Role</TableHead>
                <TableHead className="px-4">Plan Name</TableHead>
                <TableHead className="px-4">Amount</TableHead>
                <TableHead className="px-4">Transaction ID</TableHead>
                <TableHead className="px-4">Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((payment) => (
                <TableRow key={payment.stripeSessionId || String(payment._id)}>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {payment.userName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {payment.userEmail}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <RoleBadge role={payment.userRole} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-foreground">
                    {payment.planName}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="font-heading font-extrabold tracking-tight text-foreground">
                      ${Number(payment.amount).toFixed(2)}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      {payment.currency}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className="block max-w-44 truncate font-mono text-xs text-muted-foreground"
                      title={payment.transactionId}
                    >
                      {payment.transactionId}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {fmtDate(payment.paidAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
