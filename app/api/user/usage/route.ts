import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's token usage
    const { data: usage, error } = await supabase
      .from("token_usage")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching usage:", error)
      return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 })
    }

    // Get detailed usage logs
    const { data: usageLogs, error: logsError } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (logsError) {
      console.error("Error fetching usage logs:", logsError)
    }

    // Get subscription info for token limits
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_plans (
          id,
          name,
          tokens_per_month
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (subError) {
      console.error("Error fetching subscription:", subError)
    }

    return NextResponse.json({ 
      tokenUsage: usage,
      usageLogs: usageLogs || [],
      subscription: subscription || null
    })
  } catch (error) {
    console.error("Error in usage API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}