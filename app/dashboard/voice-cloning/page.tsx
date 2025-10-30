"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Upload, Play, Download, Loader2, AlertCircle, FileAudio, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function VoiceCloningPage() {
  const [voiceName, setVoiceName] = useState("")
  const [description, setDescription] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [clonedVoices, setClonedVoices] = useState<any[]>([])
  const [selectedVoice, setSelectedVoice] = useState("")
  const [textToSpeak, setTextToSpeak] = useState("")
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingVoices, setLoadingVoices] = useState(true)

  useEffect(() => {
    fetchVoiceClones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVoiceClones = async () => {
    setLoadingVoices(true)
    try {
      const response = await fetch("/api/user/voice-clones")
      const data = await response.json()
      
      if (response.ok && data.voiceClones) {
        setClonedVoices(data.voiceClones)
      } else {
        console.error("Failed to fetch voice clones:", data.error)
      }
    } catch (error) {
      console.error("Error fetching voice clones:", error)
    } finally {
      setLoadingVoices(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith("audio/")) {
        setError("Please select an audio file")
        return
      }
      // Check file size (max 10MB for voice cloning)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }
      setAudioFile(file)
      setError(null)
    }
  }

  const handleTrainVoice = async () => {
    if (!voiceName.trim() || !audioFile) return

    setIsTraining(true)
    setError(null)
    setTrainingProgress(0)

    try {
      const formData = new FormData()
      formData.append("name", voiceName.trim())
      formData.append("description", description.trim())
      formData.append("audio", audioFile)

      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 1000)

      const response = await fetch("/api/ai/voice-clone", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setTrainingProgress(100)
        // Refresh the voice clones list
        await fetchVoiceClones()
        setVoiceName("")
        setDescription("")
        setAudioFile(null)
        setTimeout(() => setTrainingProgress(0), 2000)
        
        // Trigger dashboard refresh to update usage
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('dashboard:refresh'))
        }
      } else {
        setError(data.error || "Failed to train voice")
        clearInterval(progressInterval)
      }
    } catch (error) {
      setError("Network error occurred")
      console.error("Error training voice:", error)
    } finally {
      setIsTraining(false)
    }
  }

  const handleGenerateSpeech = async () => {
    if (!selectedVoice || !textToSpeak.trim()) return

    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch("/api/ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToSpeak.trim(),
          voice: selectedVoice,
          quality: "high",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedAudio(data.audioUrl)
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

  const downloadAudio = (audioUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = audioUrl
    link.download = filename
    link.click()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Voice Cloning</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Create custom AI voices from your voice samples</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Train New Voice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Train New Voice
            </CardTitle>
            <CardDescription>Upload a voice sample to create a custom AI voice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voice-name">Voice Name</Label>
              <Input
                id="voice-name"
                placeholder="Enter a name for your voice"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the voice characteristics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Voice Sample</Label>
              <div className="flex items-center gap-4">
                <input
                  id="voice-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("voice-file")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose Audio File
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

            {isTraining && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Training voice...</span>
                  <span>{trainingProgress}%</span>
                </div>
                <Progress value={trainingProgress} />
              </div>
            )}

            <Button
              onClick={handleTrainVoice}
              disabled={!voiceName.trim() || !audioFile || isTraining}
              className="w-full"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Training Voice...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Train Voice
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generate Speech with Cloned Voice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Generate Speech
            </CardTitle>
            <CardDescription>Use your cloned voices to generate speech</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Voice</Label>
              {loadingVoices ? (
                <div className="text-sm text-muted-foreground">Loading voices...</div>
              ) : clonedVoices.length === 0 ? (
                <div className="text-sm text-muted-foreground">No cloned voices yet. Train a voice first.</div>
              ) : (
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="">Choose a cloned voice</option>
                  {clonedVoices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} {voice.status === "training" ? "(Training...)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-to-speak">Text to Speak</Label>
              <Textarea
                id="text-to-speak"
                placeholder="Enter the text you want to convert to speech..."
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleGenerateSpeech}
              disabled={!selectedVoice || !textToSpeak.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Speech
                </>
              )}
            </Button>

            {generatedAudio && (
              <div className="space-y-2">
                <Label>Generated Audio</Label>
                <div className="flex items-center gap-2">
                  <audio controls className="flex-1">
                    <source src={generatedAudio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadAudio(generatedAudio, `cloned_voice_${Date.now()}.mp3`)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cloned Voices List */}
      {clonedVoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Cloned Voices</CardTitle>
            <CardDescription>Manage and use your custom AI voices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {clonedVoices.map((voice) => (
                <div key={voice.voice_id} className="p-3 sm:p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm sm:text-base">{voice.name}</h4>
                    <Badge variant="outline" className="text-xs">{voice.status || "Ready"}</Badge>
                  </div>
                  {voice.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">{voice.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedVoice(voice.voice_id)}
                      className="text-xs sm:text-sm"
                    >
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Use
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Training Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Use 30-60 seconds of clear, high-quality audio</p>
          <p>• Speak in a consistent tone and pace</p>
          <p>• Minimize background noise and echo</p>
          <p>• Use a good quality microphone</p>
          <p>• Speak naturally, not too fast or slow</p>
          <p>• Include various emotions and expressions</p>
        </CardContent>
      </Card>
    </div>
  )
}
