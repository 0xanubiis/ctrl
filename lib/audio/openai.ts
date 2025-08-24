import OpenAI from "openai"

export class OpenAIClient {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    })
  }

  async speechToText(audioFile: File): Promise<{
    text: string
    language?: string
    duration?: number
  }> {
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
      })

      return {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
      }
    } catch (error) {
      console.error("OpenAI transcription error:", error)
      throw new Error("Failed to transcribe audio")
    }
  }

  async translateToEnglish(audioFile: File): Promise<{
    text: string
    language?: string
    duration?: number
  }> {
    try {
      const translation = await this.client.audio.translations.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
      })

      return {
        text: translation.text,
        duration: translation.duration,
      }
    } catch (error) {
      console.error("OpenAI translation error:", error)
      throw new Error("Failed to translate audio")
    }
  }
}
