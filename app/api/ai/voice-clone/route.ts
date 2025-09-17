import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const voiceSample = formData.get("voiceSample") as File
    const voiceName = formData.get("voiceName") as string
    const description = formData.get("description") as string

    if (!voiceSample || !voiceName) {
      return NextResponse.json({ error: "Voice sample and name are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Voice cloning typically costs more tokens
    const tokenCost = 500 // Fixed cost for voice cloning

    // Check if user has enough tokens
    const { data: canConsume } = await supabase.rpc("consume_tokens", {
      user_uuid: user.id,
      tokens_to_consume: tokenCost,
      usage_type_param: "voice_clone",
      input_text_param: `Voice clone: ${voiceName}`,
      voice_id_param: null,
      metadata_param: { voiceName, description, fileSize: voiceSample.size },
    })

    if (!canConsume) {
      return NextResponse.json({ error: "Insufficient tokens" }, { status: 402 })
    }

    // Here you would integrate with a voice cloning service
    // For now, we'll simulate the response
    const voiceId = `voice_${Date.now()}`

    // Save voice clone record
    const { error: voiceError } = await supabase.from("voice_clones").insert({
      user_id: user.id,
      voice_id: voiceId,
      voice_name: voiceName,
      description,
      sample_url: `/placeholder-audio.mp3`, // In real implementation, upload to storage
      status: "processing",
      metadata: { originalFilename: voiceSample.name, fileSize: voiceSample.size },
    })

    if (voiceError) {
      console.error("Error saving voice clone:", voiceError)
      return NextResponse.json({ error: "Failed to save voice clone" }, { status: 500 })
    }

    return NextResponse.json({
      voiceId,
      voiceName,
      status: "processing",
      tokensUsed: tokenCost,
      message: "Voice cloning started. You'll be notified when it's ready.",
    })
  } catch (error) {
    console.error("Error in voice cloning:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
