/* GET /api/checkout/verify?session_id=… — read a Checkout Session straight
   from Stripe for the success page.

   It plays two roles:
   1. the receipt: amount, currency, status and transaction id come from
      Stripe itself, never from the query string;
   2. a safety net for the webhook: if the local listener (or production
      endpoint) has not delivered `checkout.session.completed` yet, this
      finalises the same idempotent write, so the plan upgrades immediately
      on redirect. */

import { NextResponse } from "next/server"

import { getStripe } from "@/lib/stripe"
import {
  recordCompletedPayment,
  getPaymentBySessionId,
} from "@/lib/payments-db"

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/

export async function GET(request) {
  const sessionId = request.nextUrl.searchParams.get("session_id") || ""

  if (!SESSION_ID.test(sessionId)) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid Checkout session id." },
      { status: 400 }
    )
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    /* Paid → record it (no-op if the webhook already did) and return the
       receipt; unpaid → nothing to show but the pending state. */
    const payment =
      (await recordCompletedPayment(session)) ||
      (await getPaymentBySessionId(sessionId))

    return NextResponse.json({
      ok: true,
      status: session.payment_status,
      payment: payment
        ? {
            planName: payment.planName,
            amount: payment.amount,
            currency: payment.currency,
            transactionId: payment.transactionId,
            stripeSessionId: payment.stripeSessionId,
            paymentStatus: payment.paymentStatus,
            paidAt: payment.paidAt,
          }
        : null,
    })
  } catch (err) {
    console.error("Checkout session verification failed:", err)
    return NextResponse.json(
      { ok: false, error: "We could not verify this payment session." },
      { status: err?.statusCode || 500 }
    )
  }
}
