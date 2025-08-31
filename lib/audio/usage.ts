import { createClient } from "@/lib/supabase/server"

// Types of features you track
export type FeatureType = "tts" | "stt" | "noise_reduction"

// Define usage limits per tier
const USAGE_LIMITS: Record<string, Record<FeatureType, number>> = {
  free: { tts: 1000, stt: 1000, noise_reduction: 100 },
  pro: { tts: 10000, stt: 10000, noise_reduction: 1000 },
  premium: { tts: 50000, stt: 50000, noise_reduction: 5000 },
}

/**
 * Check a user's usage for a given feature, with monthly reset
 * starting from their registration date
 */
export async function checkUsageLimit(userId: string, feature: FeatureType) {
  const supabase = await createClient()

  // Get user profile with registration date + tier
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, created_at, tier")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    throw new Error("User profile not found")
  }

  const tier = profile.tier ?? "free"

  // Use registration date as cycle start
  const registrationDate = new Date(profile.created_at)
  const now = new Date()

  // Compute cycle start & end (rolling from registration)
  const cycleStart = new Date(registrationDate)
  while (cycleStart <= now) {
    const nextCycle = new Date(cycleStart)
    nextCycle.setMonth(nextCycle.getMonth() + 1)
    if (nextCycle > now) break
    cycleStart.setMonth(cycleStart.getMonth() + 1)
  }
  const cycleEnd = new Date(cycleStart)
  cycleEnd.setMonth(cycleStart.getMonth() + 1)

  // Get usage logs for this user & feature within current cycle
  const { data: usageLogs, error: usageError } = await supabase
    .from("usage_logs")
    .select("amount")
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("created_at", cycleStart.toISOString())
    .lt("created_at", cycleEnd.toISOString())

  if (usageError) {
    throw new Error("Error fetching usage logs")
  }

  // Sum up usage
  const used = usageLogs?.reduce((sum: any, log: { amount: any }) => sum + (log.amount ?? 0), 0) ?? 0
  const limit = USAGE_LIMITS[tier]?.[feature] ?? 0

  return {
    used,
    limit,
    tier,
    remaining: Math.max(limit - used, 0),
    cycle: {
      start: cycleStart,
      end: cycleEnd,
    },
  }
}
