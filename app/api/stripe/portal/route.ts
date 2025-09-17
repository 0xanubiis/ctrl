import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createBillingPortalSession } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    // Create billing portal session
    const session = await createBillingPortalSession(
      subscription.stripe_customer_id,
      `${request.nextUrl.origin}/dashboard`,
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
