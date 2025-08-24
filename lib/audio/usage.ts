import { createClient } from "@/lib/supabase/server"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"

export async function checkUsageLimit(
  userId: string,
  featureType: "tts" | "stt" | "noise_reduction",
): Promise<{
  allowed: boolean
  currentUsage: number
  limit: number
  tier: string
}> {
  const supabase = createClient()

  // Get user's subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .single()

  if (!subscription || subscription.status !== "active") {
    const freePlan = SUBSCRIPTION_PLANS.free
    const limit = freePlan.limits[featureType]

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const { data: usage } = await supabase
      .from("usage_tracking")
      .select("usage_count")
      .eq("user_id", userId)
      .eq("feature_type", featureType)
      .eq("month_year", currentMonth)
      .single()

    const currentUsage = usage?.usage_count || 0

    return {
      allowed: currentUsage < limit,
      currentUsage,
      limit,
      tier: "free",
    }
  }

  const plan = SUBSCRIPTION_PLANS[subscription.tier as keyof typeof SUBSCRIPTION_PLANS]
  const limit = plan.limits[featureType]

  // Unlimited usage for enterprise or if limit is -1
  if (limit === -1) {
    return {
      allowed: true,
      currentUsage: 0,
      limit: -1,
      tier: subscription.tier,
    }
  }

  // Get current month usage
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("usage_count")
    .eq("user_id", userId)
    .eq("feature_type", featureType)
    .eq("month_year", currentMonth)
    .single()

  const currentUsage = usage?.usage_count || 0

  return {
    allowed: currentUsage < limit,
    currentUsage,
    limit,
    tier: subscription.tier,
  }
}

export async function incrementUsage(userId: string, featureType: "tts" | "stt" | "noise_reduction"): Promise<void> {
  const supabase = createClient()
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

  // Upsert usage record
  await supabase
    .from("usage_tracking")
    .upsert(
      {
        user_id: userId,
        feature_type: featureType,
        month_year: currentMonth,
        usage_count: 1,
      },
      {
        onConflict: "user_id,feature_type,month_year",
        ignoreDuplicates: false,
      },
    )
    .select()
    .then(async ({ data, error }) => {
      if (error) throw error

      // If record exists, increment the count
      if (data && data.length > 0) {
        const currentCount = data[0].usage_count
        await supabase
          .from("usage_tracking")
          .update({ usage_count: currentCount + 1 })
          .eq("user_id", userId)
          .eq("feature_type", featureType)
          .eq("month_year", currentMonth)
      }
    })
}
