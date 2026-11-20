import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** Reusable dashboard statistic card. */
export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "primary",
}) {
  const tones = {
    primary:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  }

  return (
    <Card className="card-hover rounded-2xl">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              tones[tone]
            )}
          >
            <Icon className="size-4.5" />
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
          {value}
        </p>
        {sublabel && (
          <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default StatCard
