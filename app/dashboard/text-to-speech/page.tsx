"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Volume2, Play, Download, Loader2, AlertCircle, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const voices = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "Female", accent: "American", plan: "free" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew", gender: "Male", accent: "American", plan: "free" },
  { id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde", gender: "Male", accent: "American", plan: "free" },
  { id: "5Q0t7uMcjvnagumLfvZi", name: "Paul", gender: "Male", accent: "American", plan: "free" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", gender: "Female", accent: "American", plan: "free" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", gender: "Female", accent: "British", plan: "starter" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", gender: "Male", accent: "British", plan: "starter" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", gender: "Female", accent: "American", plan: "starter" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", gender: "Male", accent: "American", plan: "starter" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", gender: "Male", accent: "American", plan: "pro" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", gender: "Male", accent: "American", plan: "pro" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", gender: "Male", accent: "American", plan: "pro" },
  { id: "VR6AewLTigWG4xSOukaH", name: "Liam", gender: "Male", accent: "American", plan: "premium" },
  { id: "VR6AewLTigWG4xSOukaI", name: "Charlotte", gender: "Female", accent: "British", plan: "premium" },
]

const qualities = [
  { id: "standard", name: "Standard", description: "Good quality, faster generation", plan: "free" },
  { id: "high", name: "High Quality", description: "Best quality, slower generation", plan: "starter" },
]

export default function TextToSpeechPage() {
  const [text, setText] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [selectedQuality, setSelectedQuality] = useState("standard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
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

  // Check if voice is available for user's plan
  const isVoiceAvailable = (voice: any) => {
    const voicePlanLevel = planHierarchy[voice.plan as keyof typeof planHierarchy] || 0
    const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0
    return userPlanLevel >= voicePlanLevel
  }

  // Check if quality is available for user's plan
  const isQualityAvailable = (qualityId: string) => {
    const quality = qualities.find(q => q.id === qualityId)
    if (!quality) return true
    const qualityPlanLevel = planHierarchy[quality.plan as keyof typeof planHierarchy] || 0
    const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0
    return userPlanLevel >= qualityPlanLevel
  }

  const availableVoices = voices.filter(isVoiceAvailable)
  const premiumVoices = voices.filter(v => !isVoiceAvailable(v))

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
        
        // Trigger dashboard refresh to update usage
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('dashboard:refresh'))
        }
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Text to Speech</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Convert your text into natural-sounding speech using AI voices</p>
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
                      {availableVoices.map((voice) => (
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
                      {qualities.map((quality) => {
                        const isAvailable = quality.plan === "free" || 
                          (planHierarchy[quality.plan as keyof typeof planHierarchy] <= planHierarchy[userPlan as keyof typeof planHierarchy])
                        
                        return (
                          <SelectItem key={quality.id} value={quality.id} disabled={!isAvailable}>
                            <div className="flex items-center justify-between w-full">
                              <span>{quality.name}</span>
                              {!isAvailable && <Lock className="w-3 h-3 ml-2" />}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {selectedQuality === "high" && !isQualityAvailable(selectedQuality) && (
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        High quality is available for {qualities.find(q => q.id === "high")?.plan} plan and above. <Link href="/pricing" className="underline">Upgrade now</Link>
                      </AlertDescription>
                    </Alert>
                  )}
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

        <div className="space-y-4 sm:space-y-6">
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

          {premiumVoices.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Unlock More Voices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {premiumVoices.length} premium voices available with {premiumVoices[0].plan} plan or higher
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
              </CardContent>
            </Card>
          )}

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
