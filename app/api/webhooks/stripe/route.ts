import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key required for webhook writes
);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Find user by Stripe customer id
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("stripe_customer_id", session.customer)
          .single();

        if (userError || !user) {
          console.error("❌ User not found for checkout:", userError);
          break;
        }

        // Lookup plan details
        const { data: plan, error: planError } = await supabase
          .from("plans")
          .select("*")
          .eq("stripe_price_id", session.metadata?.priceId)
          .single();

        if (planError || !plan) {
          console.error("❌ Plan not found:", planError);
          break;
        }

        // Assign subscription + tokens
        await supabase.from("users").update({
          plan_id: plan.id,
          tokens_remaining: plan.tokens,
          subscription_status: "active",
          subscription_renewal: new Date().toISOString(), // today = join/renewal date
        }).eq("id", user.id);

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const priceId = subscription.items.data[0].price.id;

        // Lookup plan
        const { data: plan } = await supabase
          .from("plans")
          .select("*")
          .eq("stripe_price_id", priceId)
          .single();

        if (plan) {
          await supabase
            .from("users")
            .update({
              plan_id: plan.id,
              tokens_remaining: plan.tokens,
              subscription_status: subscription.status,
              subscription_renewal: new Date().toISOString(),
            })
            .eq("stripe_customer_id", subscription.customer as string);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Downgrade to Free
        const { data: freePlan } = await supabase
          .from("plans")
          .select("*")
          .eq("name", "Free")
          .single();

        if (freePlan) {
          await supabase
            .from("users")
            .update({
              plan_id: freePlan.id,
              tokens_remaining: freePlan.tokens,
              subscription_status: "canceled",
              subscription_renewal: null,
            })
            .eq("stripe_customer_id", subscription.customer as string);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

