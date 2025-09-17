import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // 'day', 'week', 'month', 'year'

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current token usage
    const { data: tokenUsage } = await supabase.from("token_usage").select("*").eq("user_id", user.id)

    // Get usage history
    const dateFilter = new Date()
    switch (period) {
      case "day":
        dateFilter.setDate(dateFilter.getDate() - 1)
        break
      case "week":
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case "month":
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
      case "year":
        dateFilter.setFullYear(dateFilter.getFullYear() - 1)
        break
    }

    const { data: usageHistory } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", dateFilter.toISOString())
      .order("created_at", { ascending: true })

    // Get subscription info
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    return NextResponse.json({
      tokenUsage,
      usageHistory,
      subscription,
      period,
    })
  } catch (error) {
    console.error("Error fetching usage data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
