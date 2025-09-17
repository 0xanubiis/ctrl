import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Disable body parsing (needed for Stripe webhooks)
export const config = {
  api: {
    bodyParser: false,
  },
};

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
          .from("plans")
          .select("*")
          .eq("stripe_price_id", session.metadata?.priceId)
          .single();

        if (!plan) break;

        await supabase.from("users").update({
          plan_id: plan.id,
          tokens_remaining: plan.tokens,
          subscription_status: "active",
          subscription_renewal: new Date().toISOString(),
        }).eq("id", user.id);

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;

        const { data: plan } = await supabase
          .from("plans")
          .select("*")
          .eq("stripe_price_id", priceId)
          .single();

        if (plan) {
          await supabase.from("users").update({
            plan_id: plan.id,
            tokens_remaining: plan.tokens,
            subscription_status: subscription.status,
            subscription_renewal: new Date().toISOString(),
          }).eq("stripe_customer_id", subscription.customer as string);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: freePlan } = await supabase
          .from("plans")
          .select("*")
          .eq("name", "Free")
          .single();

        if (freePlan) {
          await supabase.from("users").update({
            plan_id: freePlan.id,
            tokens_remaining: freePlan.tokens,
            subscription_status: "canceled",
            subscription_renewal: null,
          }).eq("stripe_customer_id", subscription.customer as string);
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

