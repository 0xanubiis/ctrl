import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { updateSubscriptionStatus, createSubscriptionRecord, resetUserTokens } from "@/lib/subscription"
import type Stripe from "stripe"

export const dynamic = 'force-dynamic'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, planId, billingCycle } = session.metadata!

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          await createSubscriptionRecord(
            userId,
            planId,
            subscription.id,
            session.customer as string,
            subscription.status,
            billingCycle as "monthly" | "yearly",
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
          )

          // Reset user tokens based on new plan
          await resetUserTokens(userId, planId)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

          await updateSubscriptionStatus(
            subscription.id,
            subscription.status,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
          )
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await updateSubscriptionStatus(invoice.subscription as string, "past_due")
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Check if the subscription has a plan change
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (existingSubscription) {
          // Update subscription status and period
          await updateSubscriptionStatus(
            subscription.id,
            subscription.status,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
          )

          // Check if the plan has changed by comparing the price ID
          const currentPriceId = subscription.items.data[0]?.price.id
          if (currentPriceId && existingSubscription.plan_id) {
            // Get the plan ID from the price ID (you may need to map this)
            const { data: plan } = await supabase
              .from("subscription_plans")
              .select("id")
              .or(`stripe_price_id_monthly.eq.${currentPriceId},stripe_price_id_yearly.eq.${currentPriceId}`)
              .single()

            if (plan && plan.id !== existingSubscription.plan_id) {
              // Plan has changed - update the plan and reset tokens
              await supabase
                .from("subscriptions")
                .update({ plan_id: plan.id })
                .eq("stripe_subscription_id", subscription.id)

              // Reset tokens for the new plan
              await resetUserTokens(existingSubscription.user_id, plan.id)
            }
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await updateSubscriptionStatus(subscription.id, "canceled")
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
