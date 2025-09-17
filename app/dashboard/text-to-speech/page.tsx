"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Volume2, Play, Download, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

const voices = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "Female", accent: "American" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew", gender: "Male", accent: "American" },
  { id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde", gender: "Male", accent: "American" },
  { id: "5Q0t7uMcjvnagumLfvZi", name: "Paul", gender: "Male", accent: "American" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", gender: "Female", accent: "American" },
]

const qualities = [
  { id: "standard", name: "Standard", description: "Good quality, faster generation" },
  { id: "high", name: "High Quality", description: "Best quality, slower generation" },
]

export default function TextToSpeechPage() {
  const [text, setText] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [selectedQuality, setSelectedQuality] = useState("standard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [tokensUsed, setTokensUsed] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return

    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch("/api/ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          quality: selectedQuality,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAudioUrl(data.audioUrl)
        setTokensUsed(data.tokensUsed)
      } else {
        setError(data.error || "Failed to generate speech")
      }
    } catch (error) {
      setError("Network error occurred")
      console.error("Error generating speech:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const estimatedTokens = text.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Text to Speech</h1>
        <p className="text-muted-foreground">Convert your text into natural-sounding speech using AI voices</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Generate Speech
              </CardTitle>
              <CardDescription>Enter your text and select voice settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Text to Convert</Label>
                <Textarea
                  id="text"
                  placeholder="Enter the text you want to convert to speech..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{text.length} characters</span>
                  <span>~{estimatedTokens} tokens</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex items-center gap-2">
                            <span>{voice.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {voice.gender}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualities.map((quality) => (
                        <SelectItem key={quality.id} value={quality.id}>
                          {quality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!text.trim() || !selectedVoice || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Generate Speech
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Audio</CardTitle>
                {tokensUsed && <CardDescription>Used {tokensUsed} tokens for this generation</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <audio controls className="flex-1">
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = audioUrl
                      link.download = `speech_${Date.now()}.mp3`
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVoice ? (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium">{voices.find((v) => v.id === selectedVoice)?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {voices.find((v) => v.id === selectedVoice)?.gender} •{" "}
                      {voices.find((v) => v.id === selectedVoice)?.accent}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Play className="w-4 h-4 mr-2" />
                    Preview Voice
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Select a voice to see preview</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Use punctuation for natural pauses</p>
              <p>• CAPS for emphasis</p>
              <p>• Add commas for breathing room</p>
              <p>• Keep sentences under 200 characters</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
