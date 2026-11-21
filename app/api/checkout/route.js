/* POST /api/checkout — starts a real Stripe Checkout Session for a Pro plan.

   The price comes from PLANS (dynamic price_data), so no Product/Price has to
   be created in the Stripe dashboard first. The signed-in better-auth session
   decides who is buying; plan audience is re-checked here because the client
   button is not authoritative. */

import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { getStripe } from "@/lib/stripe"
import { auth } from "@/lib/auth"
import { PLANS } from "@/lib/constants"

export async function POST(request) {
  try {
    const headerList = await headers()
    const session = await auth.api.getSession({ headers: headerList })
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to upgrade your plan." },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const plan = Object.values(PLANS).find((p) => p.id === body?.planId)

    if (!plan || !(plan.price > 0)) {
      return NextResponse.json(
        { error: "Unknown or free plan." },
        { status: 400 }
      )
    }
    if (plan.audience && session.user.role !== plan.audience) {
      return NextResponse.json(
        { error: `The ${plan.name} plan is for ${plan.audience}s only.` },
        { status: 403 }
      )
    }
    if (session.user.plan === "pro") {
      return NextResponse.json(
        { error: "You are already on a Pro plan." },
        { status: 400 }
      )
    }

    const origin =
      headerList.get("origin") ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000"

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(plan.price * 100),
            product_data: {
              name: `MentorLagbe ${plan.name}`,
              description: plan.tagline || "One-time Pro upgrade",
            },
          },
        },
      ],
      /* Carried through to the webhook + success page so the payment record
         can be tied back to the buyer without trusting the client. */
      metadata: {
        planId: plan.id,
        planName: plan.name,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name || "",
        userRole: session.user.role || "",
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (err) {
    console.error("Checkout session creation failed:", err)
    return NextResponse.json(
      { error: err?.message || "Could not start checkout." },
      { status: err?.statusCode || 500 }
    )
  }
}
