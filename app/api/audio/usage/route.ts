import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkUsageLimit } from "@/lib/audio/usage"

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get usage for all features
    const [ttsUsage, sttUsage, noiseReductionUsage] = await Promise.all([
      checkUsageLimit(user.id, "tts"),
      checkUsageLimit(user.id, "stt"),
      checkUsageLimit(user.id, "noise_reduction"),
    ])

    return NextResponse.json({
      success: true,
      usage: {
        tts: {
          used: ttsUsage.used,
          limit: ttsUsage.limit,
          remaining: ttsUsage.remaining,
        },
        stt: {
          used: sttUsage.used,
          limit: sttUsage.limit,
          remaining: sttUsage.remaining,
        },
        noise_reduction: {
          used: noiseReductionUsage.used,
          limit: noiseReductionUsage.limit,
          remaining: noiseReductionUsage.remaining,
        },
      },
      tier: ttsUsage.tier,
      cycle: ttsUsage.cycle, // All features share the same cycle
    })
  } catch (error) {
    console.error("Usage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
