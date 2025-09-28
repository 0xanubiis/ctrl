import { createClient } from "@/lib/supabase/server"

export async function getUserSubscription(userId: string) {
  const supabase = await createClient()

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  if (error) {
    console.error("Error fetching subscription:", error)
    return null
  }

  return subscription
}

export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date,
) {
  const supabase = await createClient()

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (currentPeriodStart) {
    updateData.current_period_start = currentPeriodStart.toISOString()
  }

  if (currentPeriodEnd) {
    updateData.current_period_end = currentPeriodEnd.toISOString()
  }

  const { error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("stripe_subscription_id", stripeSubscriptionId)

  if (error) {
    console.error("Error updating subscription:", error)
    throw error
  }
}

export async function createSubscriptionRecord(
  userId: string,
  planId: string,
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  status: string,
  billingCycle: "monthly" | "yearly",
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
) {
  const supabase = await createClient()

  const { error } = await supabase.from("subscriptions").insert({
    user_id: userId,
    plan_id: planId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    status,
    billing_cycle: billingCycle,
    current_period_start: currentPeriodStart.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
  })

  if (error) {
    console.error("Error creating subscription record:", error)
    throw error
  }
}

export async function resetUserTokens(userId: string, planId: string) {
  const supabase = await createClient()

  // Get the plan's token allocation
  const { data: plan } = await supabase.from("subscription_plans").select("tokens_per_month").eq("id", planId).single()

  if (!plan) return

  // Reset tokens for all usage types
  const usageTypes = ["tts", "stt", "voice_clone"]

  for (const usageType of usageTypes) {
    await supabase.from("token_usage").upsert({
      user_id: userId,
      tokens_used: 0,
      tokens_remaining: plan.tokens_per_month,
      usage_type: usageType,
      reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    })
  }
}

export async function updateSubscriptionPlan(
  stripeSubscriptionId: string,
  newPlanId: string,
  userId: string,
) {
  const supabase = await createClient()

  // Update the subscription plan
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({ 
      plan_id: newPlanId,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId)

  if (updateError) {
    console.error("Error updating subscription plan:", updateError)
    throw updateError
  }

  // Reset tokens for the new plan
  await resetUserTokens(userId, newPlanId)
}
