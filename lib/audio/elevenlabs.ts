export interface TTSRequest {
  text: string
  voice_id?: string
  model_id?: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
}

export interface TTSResponse {
  audio_url: string
  character_count: number
  request_id: string
}

export class ElevenLabsClient {
  private apiKey: string
  private baseUrl = "https://api.elevenlabs.io/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async textToSpeech(request: TTSRequest): Promise<ArrayBuffer> {
    const voiceId = request.voice_id || "21m00Tcm4TlvDq8ikWAM" // Default voice
    const url = `${this.baseUrl}/text-to-speech/${voiceId}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": this.apiKey,
      },
      body: JSON.stringify({
        text: request.text,
        model_id: request.model_id || "eleven_monolingual_v1",
        voice_settings: request.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    return response.arrayBuffer()
  }

  async getVoices() {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        "xi-api-key": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch voices")
    }

    return response.json()
  }
}
