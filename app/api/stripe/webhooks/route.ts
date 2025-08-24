import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature")

    if (!signature) {
      console.error("Missing stripe-signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createClient()

    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break

      case "customer.created":
        await handleCustomerCreated(event.data.object as Stripe.Customer, supabase)
        break

      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  try {
    const customerId = subscription.customer as string
    const { data: customer } = await stripe.customers.retrieve(customerId)
    
    if (customer && typeof customer !== 'string' && customer.email) {
      // Get user by email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customer.email)
        .single()

      if (profile) {
        // Determine tier based on price ID
        let tier = "free"
        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id
          if (priceId === process.env.STRIPE_STARTER_PRICE_ID) tier = "pro"
          else if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = "premium"
        }

        // Update or create subscription
        await supabase
          .from("subscriptions")
          .upsert({
            user_id: profile.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            tier,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })

        console.log(`Subscription created for user ${profile.id}: ${tier}`)
      }
    }
  } catch (error) {
    console.error("Error handling subscription created:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  try {
    const customerId = subscription.customer as string
    const { data: customer } = await stripe.customers.retrieve(customerId)
    
    if (customer && typeof customer !== 'string' && customer.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customer.email)
        .single()

      if (profile) {
        let tier = "free"
        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id
          if (priceId === process.env.STRIPE_STARTER_PRICE_ID) tier = "pro"
          else if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = "premium"
        }

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            tier,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id)

        console.log(`Subscription updated for user ${profile.id}: ${tier} - ${subscription.status}`)
      }
    }
  } catch (error) {
    console.error("Error handling subscription updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  try {
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        cancel_at_period_end: true,
      })
      .eq("stripe_subscription_id", subscription.id)

    console.log(`Subscription deleted: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  try {
    if (invoice.subscription) {
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
        })
        .eq("stripe_subscription_id", invoice.subscription as string)

      console.log(`Payment succeeded for subscription: ${invoice.subscription}`)
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  try {
    if (invoice.subscription) {
      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
        })
        .eq("stripe_subscription_id", invoice.subscription as string)

      console.log(`Payment failed for subscription: ${invoice.subscription}`)
    }
  } catch (error) {
    console.error("Error handling payment failed:", error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer, supabase: any) {
  try {
    if (customer.email) {
      console.log(`Customer created: ${customer.email}`)
    }
  } catch (error) {
    console.error("Error handling customer created:", error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  try {
    if (session.customer && session.subscription) {
      console.log(`Checkout completed for customer: ${session.customer}`)
      // The subscription.created webhook will handle the subscription creation
    }
  } catch (error) {
    console.error("Error handling checkout completed:", error)
  }
}
