import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const voiceSample = formData.get("audio") as File
    const voiceName = formData.get("name") as string
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

    // Charge 1 token per voice cloning request
    const tokenCost = 1

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

    // Upload audio sample to ElevenLabs
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    // Convert File to Buffer for ElevenLabs API
    const audioBuffer = await voiceSample.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: voiceSample.type })
    
    // Create FormData for ElevenLabs API
    const elevenLabsFormData = new FormData()
    elevenLabsFormData.append('name', voiceName)
    elevenLabsFormData.append('files', audioBlob, voiceSample.name)
    elevenLabsFormData.append('description', description || 'Custom voice clone')
    elevenLabsFormData.append('labels', JSON.stringify({
      'accent': 'american',
      'age': 'young',
      'gender': 'male',
      'use case': 'narration'
    }))

    // Call ElevenLabs Voice Cloning API
    const cloneResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
      body: elevenLabsFormData,
    })

    if (!cloneResponse.ok) {
      const errorText = await cloneResponse.text()
      console.error("ElevenLabs Voice Clone API error:", errorText)
      return NextResponse.json({ error: "Failed to create voice clone" }, { status: 500 })
    }

    const cloneData = await cloneResponse.json()
    const voiceId = cloneData.voice_id

    // Save voice clone record
    const { error: voiceError } = await supabase.from("voice_clones").insert({
      user_id: user.id,
      name: voiceName,
      description,
      voice_id: voiceId,
      sample_audio_url: `/placeholder-audio.mp3`, // In real implementation, upload to storage
      status: "training",
      metadata: { 
        originalFilename: voiceSample.name, 
        fileSize: voiceSample.size,
        elevenLabsVoiceId: voiceId,
        elevenLabsData: cloneData
      },
    })

    if (voiceError) {
      console.error("Error saving voice clone:", voiceError)
      return NextResponse.json({ error: "Failed to save voice clone" }, { status: 500 })
    }

    // Return in format expected by the frontend
    return NextResponse.json({
      voice: {
        id: voiceId,
        name: voiceName,
        description: description || "Custom voice clone",
        status: "ready",
        created_at: new Date().toISOString(),
        metadata: {
          originalFilename: voiceSample.name,
          fileSize: voiceSample.size,
          elevenLabsVoiceId: voiceId,
        }
      },
      tokensUsed: tokenCost,
      message: "Voice clone created successfully",
    })
  } catch (error) {
    console.error("Error in voice cloning:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
