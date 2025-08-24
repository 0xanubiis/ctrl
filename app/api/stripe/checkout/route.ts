import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    // Create or retrieve Stripe customer
    let customerId: string

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabase
        .from("profiles")
        .update({ 
          metadata: { 
            ...profile.metadata, 
            stripe_customer_id: customerId 
          } 
        })
        .eq("id", user.id)
    }

    // Determine subscription tier based on price ID
    let tier = "free"
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) tier = "pro"
    else if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = "premium"

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    })

    // Update subscription record
    if (existingSubscription) {
      await supabase
        .from("subscriptions")
        .update({
          stripe_customer_id: customerId,
          tier,
          status: "incomplete",
        })
        .eq("id", existingSubscription.id)
    } else {
      await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          tier,
          status: "incomplete",
        })
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
