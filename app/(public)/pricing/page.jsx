import { Check, Minus, ShieldCheck } from "lucide-react"

import PricingPlans from "@/components/pricing/pricing-plans"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FREE_TUTOR_POST_LIMIT } from "@/lib/constants"

export const metadata = { title: "Pricing" }

/* ------------------------------ comparison ------------------------------ */

const comparison = [
  {
    feature: "One-time price",
    free: "$0",
    proTutor: "$15 once",
    proStudent: "$10 once",
  },
  {
    feature: "Tuition posts",
    free: `Up to ${FREE_TUTOR_POST_LIMIT}`,
    proTutor: "Unlimited",
    proStudent: "—",
  },
  {
    feature: "Browse & apply to tuitions",
    free: true,
    proTutor: true,
    proStudent: true,
  },
  {
    feature: "Role-based dashboard",
    free: true,
    proTutor: true,
    proStudent: true,
  },
  {
    feature: "Verified Pro badge",
    free: false,
    proTutor: true,
    proStudent: false,
  },
  {
    feature: "Priority search ranking",
    free: false,
    proTutor: true,
    proStudent: false,
  },
  {
    feature: "Applicant contact details",
    free: false,
    proTutor: true,
    proStudent: false,
  },
  {
    feature: "Saved / bookmarked tuitions",
    free: false,
    proTutor: false,
    proStudent: "Unlimited",
  },
  {
    feature: "Priority application highlighting",
    free: false,
    proTutor: false,
    proStudent: true,
  },
  {
    feature: "Direct message access to tutors",
    free: false,
    proTutor: false,
    proStudent: true,
  },
  {
    feature: "Priority support",
    free: false,
    proTutor: false,
    proStudent: "Within 12 hours",
  },
]

function ComparisonCell({ value }) {
  if (value === true) {
    return (
      <Check
        className="size-4 text-emerald-500"
        strokeWidth={3}
        aria-label="Included"
      />
    )
  }
  if (value === false) {
    return (
      <Minus
        className="size-4 text-muted-foreground/60"
        aria-label="Not included"
      />
    )
  }
  return <span className="text-xs sm:text-sm">{value}</span>
}

/* --------------------------------- FAQ ---------------------------------- */

const faqs = [
  {
    id: "upgrade",
    q: "How does upgrading work?",
    a: "Tap “Subscribe with Stripe” on any Pro plan, complete the hosted Stripe checkout and you land on the payment success page — your account switches to Pro instantly and every new feature unlocks in your dashboard. No waiting, no support ticket.",
  },
  {
    id: "post-limit",
    q: `Why can free tutors only post ${FREE_TUTOR_POST_LIMIT} tuitions?`,
    a: `Free tutors can keep up to ${FREE_TUTOR_POST_LIMIT} live listings so the feed stays full of serious, reviewed batches instead of spam. Upgrade to Pro Tutor for unlimited posts, a verified badge and priority ranking in search results.`,
  },
  {
    id: "refunds",
    q: "What is your refund policy?",
    a: "Pro plans are a single one-time payment — there is nothing to cancel and no recurring charge. If a charge was made in error, email hello@mentorlagbe.com within 7 days and we will make it right.",
  },
  {
    id: "students",
    q: "How do students benefit from Pro?",
    a: "Pro Student highlights your applications so tutors see you first, unlocks unlimited saved tuitions, gives you direct message access to tutors and includes priority support within 12 hours.",
  },
  {
    id: "payments",
    q: "Which payment methods do you accept?",
    a: "Checkout is powered by Stripe, so you can pay with any major debit or credit card (Visa, Mastercard, Amex, Apple Pay). Card details are entered on Stripe's own hosted page and never touch MentorLagbe's servers.",
  },
]

/* -------------------------------- page ---------------------------------- */

export default function PricingPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      {/* ---------------------------- page header --------------------------- */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="section-title mt-3">
          Start free. Upgrade when{" "}
          <span className="text-gradient">you are ready</span>.
        </h1>
        <p className="section-lead mx-auto">
          Students can browse and apply for free forever. Tutors post their
          first two tuitions at no cost — go Pro for unlimited listings,
          priority placement and a verified badge.
        </p>
      </div>

      {/* ------------------------------ plans ------------------------------- */}
      <PricingPlans />

      <p className="mx-auto mt-8 flex w-fit items-center justify-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-emerald-500" />
        Secured payments powered by Stripe — one-time payment, no subscription
      </p>

      {/* --------------------------- comparison ----------------------------- */}
      <div className="mt-16">
        <p className="eyebrow">Compare</p>
        <h2 className="section-title mt-3">Every feature at a glance</h2>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%] pl-5">Feature</TableHead>
                <TableHead>Free</TableHead>
                <TableHead className="text-primary">Pro Tutor</TableHead>
                <TableHead>Pro Student</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="pl-5 font-medium whitespace-normal text-foreground">
                    {row.feature}
                  </TableCell>
                  <TableCell>
                    <ComparisonCell value={row.free} />
                  </TableCell>
                  <TableCell className="bg-primary/5">
                    <ComparisonCell value={row.proTutor} />
                  </TableCell>
                  <TableCell>
                    <ComparisonCell value={row.proStudent} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* -------------------------------- FAQ ------------------------------- */}
      <div className="mt-16">
        <p className="eyebrow">FAQ</p>
        <h2 className="section-title mt-3">Frequently asked questions</h2>

        <Accordion
          className="mx-auto mt-8 max-w-3xl"
          defaultValue={["upgrade"]}
        >
          {faqs.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="py-4 text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
