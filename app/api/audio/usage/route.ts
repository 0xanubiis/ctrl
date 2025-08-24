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
        tts: ttsUsage,
        stt: sttUsage,
        noise_reduction: noiseReductionUsage,
      },
      tier: ttsUsage.tier,
    })
  } catch (error) {
    console.error("Usage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
