import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripeCustomerByEmail, createStripeCustomer, createCheckoutSession } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { priceId, planId } = await request.json()

    if (!priceId || !planId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get or create Stripe customer
    let customer = await getStripeCustomerByEmail(profile.email)
    if (!customer) {
      customer = await createStripeCustomer(profile.email, profile.full_name)
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: `${request.nextUrl.origin}/dashboard?success=true`,
      cancelUrl: `${request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

