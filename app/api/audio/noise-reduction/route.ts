import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { NoiseReductionClient } from "@/lib/audio/noise-reduction"
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
    const intensity = Number.parseInt(formData.get("intensity") as string) || 50
    const preserveVoice = formData.get("preserveVoice") === "true"

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"]
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: "Invalid audio file type" }, { status: 400 })
    }

    // Validate file size (max 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(user.id, "noise_reduction")
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

    // Upload original file to Vercel Blob first
    const originalFilename = `original-${user.id}-${Date.now()}-${audioFile.name}`
    const audioBuffer = await audioFile.arrayBuffer()
    const originalBlob = await put(originalFilename, audioBuffer, {
      access: "public",
      contentType: audioFile.type,
    })

    // Initialize noise reduction client
    const noiseReduction = new NoiseReductionClient(process.env.NOISE_API_KEY!)

    // Process audio for noise reduction
    const processedAudioBuffer = await noiseReduction.reduceNoise({
      audioUrl: originalBlob.url,
      intensity,
      preserveVoice,
    })

    // Upload processed file to Vercel Blob
    const processedFilename = `noise-reduced-${user.id}-${Date.now()}-${audioFile.name}`
    const processedBlob = await put(processedFilename, processedAudioBuffer, {
      access: "public",
      contentType: audioFile.type,
    })

    // Save to database
    const { data: audioFileRecord } = await supabase
      .from("audio_files")
      .insert({
        user_id: user.id,
        filename: processedFilename,
        original_filename: audioFile.name,
        file_size: processedAudioBuffer.byteLength,
        file_type: "noise_reduction",
        status: "completed",
        storage_path: processedBlob.url,
        metadata: {
          original_url: originalBlob.url,
          intensity,
          preserve_voice: preserveVoice,
          original_size: audioFile.size,
          processed_size: processedAudioBuffer.byteLength,
        },
      })
      .select()
      .single()

    // Increment usage
    await incrementUsage(user.id, "noise_reduction")

    return NextResponse.json({
      success: true,
      original_url: originalBlob.url,
      processed_url: processedBlob.url,
      file_id: audioFileRecord?.id,
      reduction_info: {
        intensity,
        preserve_voice: preserveVoice,
        size_reduction: (((audioFile.size - processedAudioBuffer.byteLength) / audioFile.size) * 100).toFixed(1),
      },
      usage: {
        current: usageCheck.currentUsage + 1,
        limit: usageCheck.limit,
      },
    })
  } catch (error) {
    console.error("Noise reduction API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
