import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/* Fallback shown while /dashboard/profile resolves — mirrors the
   two-column form + side-card layout of the real page. */
export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border border-border lg:col-span-2">
          <CardHeader className="gap-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-9 w-36" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-border">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="size-20 rounded-full" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
