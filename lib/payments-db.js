/* Server-side payments helpers — the `payments` collection in MongoDB plus
   the Pro plan upgrade that follows a completed checkout.

   Both the webhook and the success-page verifier call `recordCompletedPayment`
   so the flow is idempotent: whichever arrives first writes the record, the
   other one is a no-op upsert on `stripeSessionId`. */

import { MongoClient } from "mongodb"

const DB_NAME = "mentor_lagbe_db"

/* Reuse one client across dev HMR reloads — a fresh client per edit leaks
   connections until Mongo refuses new ones. */
const globalForMongo = globalThis
const client =
  globalForMongo.__mentorLagbeMongoClient ??
  new MongoClient(process.env.MONGO_URI)
globalForMongo.__mentorLagbeMongoClient = client

const db = () => client.db(DB_NAME)

export const paymentsCollection = () => db().collection("payments")
export const usersCollection = () => db().collection("user")

/* Exact, case-insensitive email match without letting the address be read as
   a regex (Stripe emails are safe, but escape anyway). */
const emailFilter = (email) => {
  const escaped = String(email).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return { email: { $regex: `^${escaped}$`, $options: "i" } }
}

/**
 * Persist a paid Checkout Session and unlock Pro on the buyer's account.
 *
 * @param {import("stripe").Stripe.Checkout.Session} session
 * @returns {Promise<object|null>} the payment document, or null when the
 *   session has not been paid (so an open checkout never writes a record).
 */
export async function recordCompletedPayment(session) {
  if (!session?.id) return null
  if (session.payment_status !== "paid") return null

  const metadata = session.metadata || {}
  const email = (
    session.customer_details?.email ||
    metadata.userEmail ||
    ""
  ).toLowerCase()

  const now = new Date().toISOString()
  const payment = {
    stripeSessionId: session.id,
    transactionId:
      (typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id) || session.id,
    planId: metadata.planId || "",
    planName: metadata.planName || "",
    userEmail: email,
    userName: metadata.userName || "",
    userRole: metadata.userRole || "",
    amount: Number(session.amount_total || 0) / 100,
    currency: String(session.currency || "usd").toUpperCase(),
    paymentStatus: "paid",
    paidAt: now,
  }

  await paymentsCollection().updateOne(
    { stripeSessionId: session.id },
    { $set: payment, $setOnInsert: { createdAt: now } },
    { upsert: true }
  )

  if (email) {
    await usersCollection().updateOne(emailFilter(email), {
      $set: { plan: "pro", planId: payment.planId, planName: payment.planName },
    })
  }

  return payment
}

/** The stored receipt for a Checkout Session, or null if not recorded yet. */
export async function getPaymentBySessionId(sessionId) {
  if (!sessionId) return null
  return paymentsCollection().findOne({ stripeSessionId: sessionId })
}

/** Every recorded payment, newest first — admin views only. */
export async function listPayments() {
  return paymentsCollection().find({}).sort({ paidAt: -1 }).toArray()
}
