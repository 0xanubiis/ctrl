import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user statistics
    const { data: userStats } = await supabase.from("profiles").select("role, created_at")

    const totalUsers = userStats?.length || 0
    const adminUsers = userStats?.filter((u) => u.role === "admin").length || 0
    const regularUsers = totalUsers - adminUsers

    // Get subscription statistics
    const { data: subscriptions } = await supabase.from("subscriptions").select("tier, status, created_at")

    const subscriptionStats = {
      total: subscriptions?.length || 0,
      active: subscriptions?.filter((s) => s.status === "active").length || 0,
      canceled: subscriptions?.filter((s) => s.status === "canceled").length || 0,
      by_tier: {
        free: subscriptions?.filter((s) => s.tier === "free").length || 0,
        starter: subscriptions?.filter((s) => s.tier === "starter").length || 0,
        pro: subscriptions?.filter((s) => s.tier === "pro").length || 0,
        enterprise: subscriptions?.filter((s) => s.tier === "enterprise").length || 0,
      },
    }

    // Get usage statistics
    const { data: usageStats } = await supabase.from("usage_tracking").select("feature_type, usage_count, month_year")

    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentMonthUsage = usageStats?.filter((u) => u.month_year === currentMonth) || []

    const usageByFeature = {
      tts: currentMonthUsage.filter((u) => u.feature_type === "tts").reduce((sum, u) => sum + u.usage_count, 0),
      stt: currentMonthUsage.filter((u) => u.feature_type === "stt").reduce((sum, u) => sum + u.usage_count, 0),
      noise_reduction: currentMonthUsage
        .filter((u) => u.feature_type === "noise_reduction")
        .reduce((sum, u) => sum + u.usage_count, 0),
    }

    // Get audio files statistics
    const { data: audioFiles } = await supabase.from("audio_files").select("file_type, status, created_at, file_size")

    const audioStats = {
      total: audioFiles?.length || 0,
      by_type: {
        tts: audioFiles?.filter((f) => f.file_type === "tts").length || 0,
        stt: audioFiles?.filter((f) => f.file_type === "stt").length || 0,
        noise_reduction: audioFiles?.filter((f) => f.file_type === "noise_reduction").length || 0,
      },
      total_size: audioFiles?.reduce((sum, f) => sum + f.file_size, 0) || 0,
    }

    // Calculate growth metrics (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUsers = userStats?.filter((u) => new Date(u.created_at) > thirtyDaysAgo).length || 0
    const recentSubscriptions = subscriptions?.filter((s) => new Date(s.created_at) > thirtyDaysAgo).length || 0
    const recentAudioFiles = audioFiles?.filter((f) => new Date(f.created_at) > thirtyDaysAgo).length || 0

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admin: adminUsers,
          regular: regularUsers,
          recent: recentUsers,
        },
        subscriptions: subscriptionStats,
        usage: usageByFeature,
        audio: audioStats,
        growth: {
          new_users: recentUsers,
          new_subscriptions: recentSubscriptions,
          new_files: recentAudioFiles,
        },
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
