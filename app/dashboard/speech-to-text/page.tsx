"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Mic, Upload, Download, Loader2, AlertCircle, FileAudio, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const languages = [
  { id: "en", name: "English", flag: "🇺🇸", plan: "free" },
  { id: "es", name: "Spanish", flag: "🇪🇸", plan: "free" },
  { id: "fr", name: "French", flag: "🇫🇷", plan: "free" },
  { id: "de", name: "German", flag: "🇩🇪", plan: "starter" },
  { id: "it", name: "Italian", flag: "🇮🇹", plan: "starter" },
  { id: "pt", name: "Portuguese", flag: "🇵🇹", plan: "starter" },
  { id: "ru", name: "Russian", flag: "🇷🇺", plan: "pro" },
  { id: "ja", name: "Japanese", flag: "🇯🇵", plan: "pro" },
  { id: "ko", name: "Korean", flag: "🇰🇷", plan: "pro" },
  { id: "zh", name: "Chinese", flag: "🇨🇳", plan: "premium" },
]

export default function SpeechToTextPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [tokensUsed, setTokensUsed] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>("free")

  useEffect(() => {
    fetchUserPlan()
  }, [])

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/user/subscription")
      if (response.ok) {
        const data = await response.json()
        const planName = data?.subscription_plans?.name?.toLowerCase() || "free"
        setUserPlan(planName)
      }
    } catch (error) {
      console.error("Error fetching user plan:", error)
    }
  }

  // Plan hierarchy for feature gating
  const planHierarchy = { free: 0, starter: 1, pro: 2, premium: 3 }

  // Check if language is available for user's plan
  const isLanguageAvailable = (language: any) => {
    const languagePlanLevel = planHierarchy[language.plan as keyof typeof planHierarchy] || 0
    const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0
    return userPlanLevel >= languagePlanLevel
  }

  const availableLanguages = languages.filter(isLanguageAvailable)
  const premiumLanguages = languages.filter(l => !isLanguageAvailable(l))

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith("audio/")) {
        setError("Please select an audio file")
        return
      }
      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setError("File size must be less than 25MB")
        return
      }
      setAudioFile(file)
      setError(null)
    }
  }

  const handleTranscribe = async () => {
    if (!audioFile) return

    setIsProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("language", selectedLanguage)

      const response = await fetch("/api/ai/speech-to-text", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setTranscription(data.transcription)
        setTokensUsed(data.tokensUsed)
        
        // Trigger dashboard refresh to update usage
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('dashboard:refresh'))
        }
      } else {
        setError(data.error || "Failed to transcribe audio")
      }
    } catch (error) {
      setError("Network error occurred")
      console.error("Error transcribing audio:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTranscription = () => {
    if (!transcription) return
    
    const blob = new Blob([transcription], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `transcription_${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const estimatedTokens = audioFile ? Math.ceil(audioFile.size / (1024 * 1024) * 60) : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Speech to Text</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Convert your audio files into accurate text using AI transcription</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Upload Audio File
              </CardTitle>
              <CardDescription>Select an audio file and choose the language for transcription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audio-file">Audio File</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("audio-file")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  {audioFile && (
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{audioFile.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => {
                      const isAvailable = isLanguageAvailable(language)
                      return (
                        <SelectItem key={language.id} value={language.id} disabled={!isAvailable}>
                          <div className="flex items-center gap-2">
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                            {!isAvailable && <Lock className="w-3 h-3 ml-auto" />}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {audioFile && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Estimated tokens: ~{estimatedTokens}</span>
                  <span>Duration: ~{Math.ceil(estimatedTokens / 60)} minutes</span>
                </div>
              )}

              <Button
                onClick={handleTranscribe}
                disabled={!audioFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Transcribe Audio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {transcription && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transcription Result</CardTitle>
                  <div className="flex items-center gap-2">
                    {tokensUsed && (
                      <Badge variant="outline" className="text-xs">
                        {tokensUsed} tokens used
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={downloadTranscription}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcription}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• MP3, WAV, M4A</p>
              <p>• AAC, FLAC, OGG</p>
              <p>• Maximum 25MB</p>
              <p>• Up to 3 hours duration</p>
            </CardContent>
          </Card>

          {premiumLanguages.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Unlock More Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {premiumLanguages.length} additional languages available with {premiumLanguages[0].plan} plan or higher
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Use clear, high-quality audio</p>
              <p>• Minimize background noise</p>
              <p>• Speak clearly and at normal pace</p>
              <p>• Choose the correct language</p>
              <p>• Use mono audio when possible</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
