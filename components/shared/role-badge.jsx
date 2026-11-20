import { cn } from "@/lib/utils"
import { ROLE_LABELS, STATUS_STYLES } from "@/lib/constants"

/** Small pill used across navbar, tables and dashboards. */
export function RoleBadge({ role, plan, className }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
          STATUS_STYLES[role] || STATUS_STYLES.free,
          className
        )}
      >
        {ROLE_LABELS[role] || role}
      </span>
      {plan === "pro" && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            STATUS_STYLES.pro
          )}
        >
          Pro
        </span>
      )}
    </span>
  )
}

/** Generic status pill for tuition / application / payment statuses. */
export function StatusBadge({ status, label, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status] || "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      {label || status}
    </span>
  )
}

export default RoleBadge
