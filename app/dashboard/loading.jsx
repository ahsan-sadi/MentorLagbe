import { StatsGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <StatsGridSkeleton count={4} />
      <TableSkeleton rows={5} cols={5} />
    </div>
  )
}
