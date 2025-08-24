import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { OpenAIClient } from "@/lib/audio/openai"
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

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = formData.get("language") as string
    const translate = formData.get("translate") === "true"

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"]
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: "Invalid audio file type" }, { status: 400 })
    }

    // Validate file size (max 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 })
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(user.id, "stt")
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

    // Initialize OpenAI client
    const openai = new OpenAIClient(process.env.OPENAI_API_KEY!)

    // Transcribe or translate audio
    const result = translate ? await openai.translateToEnglish(audioFile) : await openai.speechToText(audioFile)

    // Upload original file to Vercel Blob
    const filename = `stt-${user.id}-${Date.now()}-${audioFile.name}`
    const audioBuffer = await audioFile.arrayBuffer()
    const blob = await put(filename, audioBuffer, {
      access: "public",
      contentType: audioFile.type,
    })

    // Save to database
    const { data: audioFileRecord } = await supabase
      .from("audio_files")
      .insert({
        user_id: user.id,
        filename,
        original_filename: audioFile.name,
        file_size: audioFile.size,
        duration_seconds: result.duration,
        file_type: "stt",
        status: "completed",
        storage_path: blob.url,
        metadata: {
          transcription: result.text,
          language: result.language,
          translated: translate,
          duration: result.duration,
        },
      })
      .select()
      .single()

    // Increment usage
    await incrementUsage(user.id, "stt")

    return NextResponse.json({
      success: true,
      transcription: result.text,
      language: result.language,
      duration: result.duration,
      file_id: audioFileRecord?.id,
      audio_url: blob.url,
      usage: {
        current: usageCheck.currentUsage + 1,
        limit: usageCheck.limit,
      },
    })
  } catch (error) {
    console.error("STT API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
