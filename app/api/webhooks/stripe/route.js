/* POST /api/webhooks/stripe — the source of truth for a completed payment.

   Stripe signs every webhook; the raw body is required for signature
   verification, so this route reads `req.text()` and never JSON-parses first.

   Local dev:
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
   …then copy the printed whsec_… into STRIPE_WEBHOOK_SECRET in .env. */

import { NextResponse } from "next/server"

import { getStripe } from "@/lib/stripe"
import { recordCompletedPayment } from "@/lib/payments-db"

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")

  if (!secret) {
    return NextResponse.json(
      {
        error:
          "STRIPE_WEBHOOK_SECRET is not set — run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and paste the signing secret into .env.",
      },
      { status: 500 }
    )
  }

  const payload = await request.text()

  let event
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret)
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    if (event.type === "checkout.session.completed") {
      /* Idempotent: repeats of the same event upsert the same document. */
      const payment = await recordCompletedPayment(event.data.object)
      if (payment) {
        console.log(
          `Stripe payment recorded: ${payment.stripeSessionId} (${payment.planName}, ${payment.currency} ${payment.amount})`
        )
      }
    }
  } catch (err) {
    console.error("Webhook handling failed:", err)
    /* 500 makes Stripe retry — recordCompletedPayment is idempotent, so a
       retry after a partial write cannot double-charge or duplicate. */
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
