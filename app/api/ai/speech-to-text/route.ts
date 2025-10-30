import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Charge 1 token per request regardless of audio length
    const tokenCost = 1

    // Check if user has enough tokens
    const { data: canConsume } = await supabase.rpc("consume_tokens", {
      user_uuid: user.id,
      tokens_to_consume: tokenCost,
      usage_type_param: "stt",
      input_text_param: `Audio file: ${audioFile.name}`,
      voice_id_param: null,
      metadata_param: { language, fileSize: audioFile.size, durationMinutes: estimatedDurationMinutes },
    })

    if (!canConsume) {
      return NextResponse.json({ error: "Insufficient tokens" }, { status: 402 })
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Convert File to Buffer for OpenAI API
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type })
    
    // Create FormData for OpenAI API
    const openaiFormData = new FormData()
    openaiFormData.append('file', audioBlob, audioFile.name)
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('language', language)
    openaiFormData.append('response_format', 'text')

    // Call OpenAI Whisper API
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error("OpenAI Whisper API error:", errorText)
      return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
    }

    const transcription = await transcriptionResponse.text()

    // Save transcription record
    const { error: fileError } = await supabase.from("audio_files").insert({
      user_id: user.id,
      filename: `stt_${Date.now()}.txt`,
      original_text: transcription,
      file_url: null, // No audio output for STT
      file_size: audioFile.size,
      duration_seconds: estimatedDurationMinutes * 60,
      quality: "standard",
      format: "txt",
      usage_type: "stt",
      metadata: { 
        language, 
        originalFilename: audioFile.name, 
        fileSize: audioFile.size,
        durationMinutes: estimatedDurationMinutes,
        model: "whisper-1"
      },
    })

    if (fileError) {
      console.error("Error saving transcription:", fileError)
    }

    return NextResponse.json({
      transcription,
      tokensUsed: tokenCost,
      language,
    })
  } catch (error) {
    console.error("Error in speech-to-text:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
