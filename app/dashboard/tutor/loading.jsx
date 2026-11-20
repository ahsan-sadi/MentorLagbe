import { StatsGridSkeleton, TableSkeleton } from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function TutorLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <StatsGridSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-6 w-40" />
          <TableSkeleton rows={5} cols={4} />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}
