import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Calculate token cost (rough estimate: 1 token per second of audio)
    // In a real implementation, you'd get the actual duration
    const fileSizeInMB = audioFile.size / (1024 * 1024)
    const estimatedDurationSeconds = Math.ceil(fileSizeInMB * 60) // Rough estimate
    const tokenCost = estimatedDurationSeconds

    // Check if user has enough tokens
    const { data: canConsume } = await supabase.rpc("consume_tokens", {
      user_uuid: user.id,
      tokens_to_consume: tokenCost,
      usage_type_param: "stt",
      input_text_param: `Audio file: ${audioFile.name}`,
      voice_id_param: null,
      metadata_param: { language, fileSize: audioFile.size },
    })

    if (!canConsume) {
      return NextResponse.json({ error: "Insufficient tokens" }, { status: 402 })
    }

    // Here you would integrate with a speech-to-text service like OpenAI Whisper
    // For now, we'll simulate the response
    const transcription =
      "This is a simulated transcription of the uploaded audio file. In a real implementation, this would be the actual transcribed text from the audio."

    // Save transcription record
    const { error: fileError } = await supabase.from("audio_files").insert({
      user_id: user.id,
      filename: `stt_${Date.now()}.txt`,
      original_text: transcription,
      file_url: null, // No audio output for STT
      quality: "standard",
      metadata: { language, originalFilename: audioFile.name, fileSize: audioFile.size },
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
