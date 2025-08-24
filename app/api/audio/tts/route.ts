import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ElevenLabsClient } from "@/lib/audio/elevenlabs"
import { checkUsageLimit, incrementUsage } from "@/lib/audio/usage"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
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

    const { text, voice_id, voice_settings } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text too long (max 5000 characters)" }, { status: 400 })
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(user.id, "tts")
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          currentUsage: usageCheck.currentUsage,
          limit: usageCheck.limit,
          tier: usageCheck.tier,
        },
        { status: 429 },
      )
    }

    // Initialize ElevenLabs client
    const elevenLabs = new ElevenLabsClient(process.env.ELEVENLABS_API_KEY!)

    // Generate speech
    const audioBuffer = await elevenLabs.textToSpeech({
      text,
      voice_id,
      voice_settings,
    })

    // Upload to Vercel Blob
    const filename = `tts-${user.id}-${Date.now()}.mp3`
    const blob = await put(filename, audioBuffer, {
      access: "public",
      contentType: "audio/mpeg",
    })

    // Save to database
    const { data: audioFile } = await supabase
      .from("audio_files")
      .insert({
        user_id: user.id,
        filename,
        original_filename: `${text.slice(0, 50)}.mp3`,
        file_size: audioBuffer.byteLength,
        file_type: "tts",
        status: "completed",
        storage_path: blob.url,
        metadata: {
          text,
          voice_id,
          voice_settings,
          character_count: text.length,
        },
      })
      .select()
      .single()

    // Increment usage
    await incrementUsage(user.id, "tts")

    return NextResponse.json({
      success: true,
      audio_url: blob.url,
      file_id: audioFile?.id,
      character_count: text.length,
      usage: {
        current: usageCheck.currentUsage + 1,
        limit: usageCheck.limit,
      },
    })
  } catch (error) {
    console.error("TTS API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
