import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ElevenLabsClient } from "@/lib/audio/elevenlabs"

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

    // Initialize ElevenLabs client
    const elevenLabs = new ElevenLabsClient(process.env.ELEVENLABS_API_KEY!)

    // Get available voices
    const voices = await elevenLabs.getVoices()

    return NextResponse.json({
      success: true,
      voices: voices.voices || [],
    })
  } catch (error) {
    console.error("Voices API error:", error)
    return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 })
  }
}
