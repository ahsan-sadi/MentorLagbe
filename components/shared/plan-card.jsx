import Link from "next/link"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SubscribeButton } from "@/components/pricing/subscribe-button"

/** Free vs Pro plan card — reused on Home (preview) and /pricing. */
export function PlanCard({
  plan,
  audience,
  currentPlan = "free",
  highlighted = false,
  compact = false,
}) {
  const isFree = plan.id === "free"
  const isCurrent = isFree ? currentPlan === "free" : currentPlan === "pro"
  const price = isFree ? "$0" : `${plan.currency}${plan.price}`

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col rounded-2xl",
        highlighted
          ? "border-primary/50 shadow-xl ring-1 shadow-primary/10 ring-primary/20"
          : "border-border"
      )}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
          Most popular
        </Badge>
      )}
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="font-heading text-lg">
          {plan.name}{" "}
          {audience && (
            <span className="text-muted-foreground">· {audience}</span>
          )}
        </CardTitle>
        <CardDescription>
          {plan.tagline || "Everything you need to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="font-heading text-4xl font-extrabold tracking-tight">
          {price}
          {!isFree && (
            <span className="text-base font-medium text-muted-foreground">
              /month
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {isFree
            ? "Free forever · no card required"
            : "Billed monthly · cancel anytime"}
        </p>
      </CardContent>
      <CardContent className="flex-1 space-y-2.5 pt-2">
        <ul className="space-y-2.5 text-sm">
          {(isFree
            ? [
                audience === "tutor"
                  ? "Post up to 2 tuition listings"
                  : "Browse & apply to tuitions",
                "Standard listing visibility",
                "Basic dashboard analytics",
                "Community support",
              ]
            : plan.features
          ).map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full",
                  isFree
                    ? "bg-muted text-muted-foreground"
                    : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
          {isFree && audience === "tutor" && (
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <X className="size-3" strokeWidth={3} />
              </span>
              <span className="text-muted-foreground">
                Verified Pro badge &amp; priority ranking
              </span>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        {isFree ? (
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/sign-up" />}
          >
            Get started free
          </Button>
        ) : isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            Current plan
          </Button>
        ) : (
          <SubscribeButton plan={plan} className="w-full" />
        )}
      </CardFooter>
    </Card>
  )
}

export default PlanCard
