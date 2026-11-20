"use client"

import Link from "next/link"
import { Inbox } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "When there is something to show, it will appear here.",
  actionLabel,
  actionHref,
}) {
  return (
    <Empty className="rounded-2xl border border-dashed border-border bg-card py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle className="font-heading">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {actionLabel && actionHref && (
        <EmptyContent>
          <Button render={<Link href={actionHref} />}>{actionLabel}</Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

export default EmptyState
