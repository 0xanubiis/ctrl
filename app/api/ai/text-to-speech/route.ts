import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateTokenConsumption } from "@/lib/token-limits"

export async function POST(request: NextRequest) {
  try {
    const { text, voice, quality = "standard" } = await request.json()

    if (!text || !voice) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tokenCost = Math.max(1, Math.ceil(text.length / 4)) // 1 token per ~4 characters

    const { data: tokenUsage } = await supabase
      .from("token_usage")
      .select("tokens_remaining, usage_type")
      .eq("user_id", user.id)
      .eq("usage_type", "tts")
      .gt("reset_date", new Date().toISOString())
      .single()

    if (!tokenUsage || !validateTokenConsumption(tokenCost, tokenUsage.tokens_remaining)) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          tokensNeeded: tokenCost,
          tokensRemaining: tokenUsage?.tokens_remaining || 0,
        },
        { status: 402 },
      )
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    // Call ElevenLabs API
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: quality === "high" ? "eleven_multilingual_v2" : "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      console.error("ElevenLabs API error:", errorText)
      return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
    }

    // Get the audio buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`

    const filename = `tts_${Date.now()}.mp3`

    // Save audio file record
    const { error: fileError } = await supabase.from("audio_files").insert({
      user_id: user.id,
      filename,
      original_text: text,
      voice_id: voice,
      file_url: audioUrl,
      file_size: audioBuffer.byteLength,
      duration_seconds: Math.ceil(text.length / 15), // Rough estimate: 15 chars per second
      quality,
      format: "mp3",
      metadata: { quality, voice, model: quality === "high" ? "eleven_multilingual_v2" : "eleven_monolingual_v1" },
    })

    if (fileError) {
      console.error("Error saving audio file:", fileError)
    }

    return NextResponse.json({
      audioUrl,
      filename,
      tokensUsed: tokenCost,
    })
  } catch (error) {
    console.error("Error in text-to-speech:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
