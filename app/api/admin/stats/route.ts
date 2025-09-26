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

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("is_admin", {
      user_uuid: user.id,
    })

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get comprehensive stats
    const { data: analytics } = await supabase.rpc("get_system_analytics")
    const { data: usageAnalytics } = await supabase.rpc("get_usage_analytics_by_day", { days_back: 30 })

    return NextResponse.json({
      systemStats: analytics?.[0] || {},
      usageAnalytics: usageAnalytics || [],
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
