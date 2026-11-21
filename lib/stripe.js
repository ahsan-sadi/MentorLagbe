/* Stripe SDK — server only. Key comes from .env (STRIPE_SECRET_KEY).
   Never import this from a client component: the secret key must not ship
   to the browser. */

import Stripe from "stripe"

let stripeClient = null

/** Lazy singleton so importing this module never throws at build time. */
export function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is missing — add it to .env (https://dashboard.stripe.com/apikeys)"
      )
    }
    stripeClient = new Stripe(key)
  }
  return stripeClient
}
