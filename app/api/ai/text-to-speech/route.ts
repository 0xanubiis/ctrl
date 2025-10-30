import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateTokenConsumption } from "@/lib/token-limits"

export const dynamic = 'force-dynamic'

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

    // Charge 1 token per request regardless of text length
    const tokenCost = 1

    // Check and consume tokens using RPC function
    const { data: canConsume } = await supabase.rpc("consume_tokens", {
      user_uuid: user.id,
      tokens_to_consume: tokenCost,
      usage_type_param: "tts",
      input_text_param: text,
      voice_id_param: voice,
      output_url_param: null, // Will be updated after generation
      metadata_param: { quality, voice, textLength: text.length, sentenceCount: sentences.length },
    })

    if (!canConsume) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          tokensNeeded: tokenCost,
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
      usage_type: "tts",
      metadata: { 
        quality, 
        voice, 
        model: quality === "high" ? "eleven_multilingual_v2" : "eleven_monolingual_v1",
        tokenCost: 1
      },
    })

    // Update the usage log with output URL
    await supabase
      .from("usage_logs")
      .update({ output_url: audioUrl })
      .eq("user_id", user.id)
      .eq("usage_type", "tts")
      .eq("input_text", text)
      .order("created_at", { ascending: false })
      .limit(1)

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
