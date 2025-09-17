export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  description?: string
  preview_url?: string
  available_for_tiers: string[]
  settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
}

export async function getElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error("ElevenLabs API key not configured")
  }

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.voices || []
  } catch (error) {
    console.error("Error fetching ElevenLabs voices:", error)
    return []
  }
}

export async function generateSpeech(
  text: string,
  voiceId: string,
  options: {
    model?: string
    stability?: number
    similarity_boost?: number
    style?: number
    use_speaker_boost?: boolean
  } = {},
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error("ElevenLabs API key not configured")
  }

  const {
    model = "eleven_monolingual_v1",
    stability = 0.5,
    similarity_boost = 0.5,
    style = 0,
    use_speaker_boost = true,
  } = options

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: {
        stability,
        similarity_boost,
        style,
        use_speaker_boost,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API error: ${errorText}`)
  }

  return response.arrayBuffer()
}
