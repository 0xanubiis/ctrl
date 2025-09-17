import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", session.customer as string)
          .single();

        if (!user) break;

        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("*")
          .or(
            `stripe_price_id_monthly.eq.${session.metadata?.priceId},stripe_price_id_yearly.eq.${session.metadata?.priceId}`
          )
          .single();

        if (!plan) break;

        await supabase
          .from("users")
          .update({
            plan_id: plan.id,
            tokens_remaining: plan.tokens_per_month,
            subscription_status: "active",
            subscription_renewal: new Date().toISOString(),
          })
          .eq("id", user.id);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;

        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("*")
          .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
          .single();

        if (plan) {
          const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();

          // Did the billing cycle just renew? (Stripe sets `billing_reason: 'subscription_cycle'`)
          const resetTokens =
            (subscription.latest_invoice as any)?.billing_reason === "subscription_cycle";

          await supabase
            .from("users")
            .update({
              plan_id: plan.id,
              tokens_remaining: resetTokens ? plan.tokens_per_month : undefined, // reset only on renewal
              subscription_status: subscription.status,
              subscription_renewal: renewalDate,
            })
            .eq("stripe_customer_id", subscription.customer as string);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: freePlan } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", "free")
          .single();

        if (freePlan) {
          await supabase
            .from("users")
            .update({
              plan_id: freePlan.id,
              tokens_remaining: freePlan.tokens_per_month,
              subscription_status: "canceled",
              subscription_renewal: null,
            })
            .eq("stripe_customer_id", subscription.customer as string);
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

