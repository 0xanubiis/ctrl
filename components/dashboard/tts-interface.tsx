"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2, Play, Pause, Download, Mic } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Voice {
  voice_id: string
  name: string
  category: string
  description?: string
}

export default function TTSInterface() {
  const [text, setText] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [voices, setVoices] = useState<Voice[]>([])
  const [stability, setStability] = useState([0.5])
  const [similarityBoost, setSimilarityBoost] = useState([0.5])
  const [quality, setQuality] = useState("standard") // standard, high, ultra
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [usage, setUsage] = useState({ current: 0, limit: 5 })
  const { toast } = useToast()

  // Load voices on component mount
  useEffect(() => {
    loadVoices()
    loadUsage()
  }, [])

  const loadVoices = async () => {
    try {
      const response = await fetch("/api/audio/voices")
      const data = await response.json()

      if (data.success) {
        setVoices(data.voices)
        if (data.voices.length > 0) {
          setSelectedVoice(data.voices[0].voice_id)
        }
      }
    } catch (error) {
      console.error("Failed to load voices:", error)
    }
  }

  const loadUsage = async () => {
    try {
      const response = await fetch("/api/audio/usage")
      const data = await response.json()

      if (data.success) {
        setUsage(data.usage.tts)
      }
    } catch (error) {
      console.error("Failed to load usage:", error)
    }
  }

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert",
        variant: "destructive",
      })
      return
    }

    if (text.length > 5000) {
      toast({
        title: "Error",
        description: "Text is too long (max 5000 characters)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setAudioUrl(null)

    try {
      const response = await fetch("/api/audio/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice_id: selectedVoice,
          quality,
          voice_settings: {
            stability: stability[0],
            similarity_boost: similarityBoost[0],
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAudioUrl(data.audio_url)
        setUsage(data.usage)
        toast({
          title: "Success",
          description: "Audio generated successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate audio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate audio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = () => {
    const audio = document.getElementById("tts-audio") as HTMLAudioElement
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = `tts-${Date.now()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const usagePercentage = usage.limit === -1 ? 0 : (usage.current / usage.limit) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Interface */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="h-5 w-5" />
              <span>Generate Speech</span>
            </CardTitle>
            <CardDescription>Enter your text and customize voice settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="text-input">Text to Convert</Label>
              <Textarea
                id="text-input"
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-32 mt-2"
                maxLength={5000}
              />
              <div className="text-sm text-muted-foreground mt-1">{text.length}/5000 characters</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voice-select">Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger id="voice-select" className="mt-2">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-muted-foreground capitalize">{voice.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {voices.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Loading voices...</p>
                )}
              </div>

              <div>
                <Label>Stability: {stability[0].toFixed(2)}</Label>
                <Slider value={stability} onValueChange={setStability} max={1} min={0} step={0.01} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher = more consistent, Lower = more expressive
                </p>
              </div>
            </div>

            <div>
              <Label>Similarity Boost: {similarityBoost[0].toFixed(2)}</Label>
              <Slider
                value={similarityBoost}
                onValueChange={setSimilarityBoost}
                max={1}
                min={0}
                step={0.01}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher = more similar to original speaker
              </p>
            </div>

            <div>
              <Label htmlFor="quality-select">Audio Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger id="quality-select" className="mt-2">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center space-x-2">
                      <span>Standard</span>
                      <span className="text-xs text-muted-foreground">(Fast, good quality)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <span>High</span>
                      <span className="text-xs text-muted-foreground">(Better quality, slower)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ultra">
                    <div className="flex items-center space-x-2">
                      <span>Ultra</span>
                      <span className="text-xs text-muted-foreground">(Best quality, slowest)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={loading || !text.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Speech"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Audio Player */}
        {audioUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Audio</CardTitle>
              <CardDescription>Play, download, or regenerate your audio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button onClick={handlePlayPause} variant="outline" size="sm">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <audio
                  id="tts-audio"
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="flex-1"
                  controls
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>
              {usage.current} / {usage.limit === -1 ? "∞" : usage.limit} generations used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={usagePercentage} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {usage.limit === -1 ? "Unlimited usage" : `${usage.limit - usage.current} generations remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Stability:</strong> Higher values make the voice more consistent but less expressive.
            </div>
            <div>
              <strong>Similarity Boost:</strong> Higher values make the voice more similar to the original speaker.
            </div>
            <div>
              <strong>Text Length:</strong> Longer texts may take more time to process.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
