/* GET /api/payments — every recorded payment, newest first.
   Admin-only: the role comes from the better-auth session, not the request. */

import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { listPayments } from "@/lib/payments-db"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admins only." }, { status: 403 })
    }

    const payments = await listPayments()
    return NextResponse.json({ payments })
  } catch (err) {
    console.error("Listing payments failed:", err)
    return NextResponse.json(
      { error: "Could not load payments." },
      { status: 500 }
    )
  }
}
