"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload, AudioWaveformIcon as Waveform, Play, Pause, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NoiseReductionInterface() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [intensity, setIntensity] = useState([50])
  const [preserveVoice, setPreserveVoice] = useState(true)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false)
  const [usage, setUsage] = useState({ current: 0, limit: 1 })
  const [reductionInfo, setReductionInfo] = useState<any>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const response = await fetch("/api/audio/usage")
      const data = await response.json()

      if (data.success) {
        setUsage(data.usage.noise_reduction)
      }
    } catch (error) {
      console.error("Failed to load usage:", error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please upload a valid audio file (MP3, MP4, WAV, WebM, OGG)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 50MB",
          variant: "destructive",
        })
        return
      }

      setAudioFile(file)
      setOriginalUrl(null)
      setProcessedUrl(null)
      setReductionInfo(null)
    }
  }

  const handleProcess = async () => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "Please upload an audio file first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setProgress(0)
    setOriginalUrl(null)
    setProcessedUrl(null)

    try {
      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("intensity", intensity[0].toString())
      formData.append("preserveVoice", preserveVoice.toString())

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)

      const response = await fetch("/api/audio/noise-reduction", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (data.success) {
        setOriginalUrl(data.original_url)
        setProcessedUrl(data.processed_url)
        setReductionInfo(data.reduction_info)
        setUsage(data.usage)
        toast({
          title: "Success",
          description: "Audio processed successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process audio",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process audio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = (type: "original" | "processed") => {
    const audioId = type === "original" ? "original-audio" : "processed-audio"
    const audio = document.getElementById(audioId) as HTMLAudioElement

    if (audio) {
      if (type === "original") {
        if (isPlayingOriginal) {
          audio.pause()
        } else {
          audio.play()
        }
        setIsPlayingOriginal(!isPlayingOriginal)
      } else {
        if (isPlayingProcessed) {
          audio.pause()
        } else {
          audio.play()
        }
        setIsPlayingProcessed(!isPlayingProcessed)
      }
    }
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const usagePercentage = usage.limit === -1 ? 0 : (usage.current / usage.limit) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Interface */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Waveform className="h-5 w-5" />
              <span>Audio Processing</span>
            </CardTitle>
            <CardDescription>Upload audio and configure noise reduction settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <Label>Upload Audio File</Label>
              <div className="mt-2">
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Audio File
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: MP3, MP4, WAV, WebM, OGG (max 50MB)
              </p>
            </div>

            {/* Selected File Info */}
            {audioFile && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center space-x-3">
                  <Waveform className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <Label>Noise Reduction Intensity: {intensity[0]}%</Label>
                <Slider value={intensity} onValueChange={setIntensity} max={100} min={0} step={1} className="mt-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Light</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Higher values remove more noise but may affect voice quality
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="preserve-voice" checked={preserveVoice} onCheckedChange={setPreserveVoice} />
                <Label htmlFor="preserve-voice">Preserve Voice Quality</Label>
              </div>
            </div>

            <Button onClick={handleProcess} disabled={loading || !audioFile} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Audio... {progress > 0 && `${progress}%`}
                </>
              ) : (
                "Process Audio"
              )}
            </Button>
            {loading && progress > 0 && (
              <Progress value={progress} className="w-full" />
            )}
          </CardContent>
        </Card>

        {/* Audio Comparison */}
        {originalUrl && processedUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Audio Comparison</CardTitle>
              <CardDescription>Compare the original and processed audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Original Audio */}
              <div>
                <Label className="text-base font-medium">Original Audio</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Button onClick={() => handlePlayPause("original")} variant="outline" size="sm">
                    {isPlayingOriginal ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => handleDownload(originalUrl, `original-${audioFile?.name}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <audio
                    id="original-audio"
                    src={originalUrl}
                    onEnded={() => setIsPlayingOriginal(false)}
                    onPlay={() => setIsPlayingOriginal(true)}
                    onPause={() => setIsPlayingOriginal(false)}
                    className="flex-1"
                    controls
                  />
                </div>
              </div>

              {/* Processed Audio */}
              <div>
                <Label className="text-base font-medium">Processed Audio</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Button onClick={() => handlePlayPause("processed")} variant="outline" size="sm">
                    {isPlayingProcessed ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => handleDownload(processedUrl, `processed-${audioFile?.name}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <audio
                    id="processed-audio"
                    src={processedUrl}
                    onEnded={() => setIsPlayingProcessed(false)}
                    onPlay={() => setIsPlayingProcessed(true)}
                    onPause={() => setIsPlayingProcessed(false)}
                    className="flex-1"
                    controls
                  />
                </div>
              </div>

              {/* Processing Info */}
              {reductionInfo && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Processing Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Intensity:</span> {reductionInfo.intensity}%
                    </div>
                    <div>
                      <span className="text-muted-foreground">Voice Preservation:</span>{" "}
                      {reductionInfo.preserve_voice ? "Enabled" : "Disabled"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size Reduction:</span> {reductionInfo.size_reduction}%
                    </div>
                  </div>
                </div>
              )}
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
              {usage.current} / {usage.limit === -1 ? "∞" : usage.limit} processes used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={usagePercentage} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {usage.limit === -1 ? "Unlimited usage" : `${usage.limit - usage.current} processes remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Intensity:</strong> Start with 50% and adjust based on results. Higher values remove more noise
              but may affect quality.
            </div>
            <div>
              <strong>Voice Preservation:</strong> Keep enabled for speech content to maintain voice clarity.
            </div>
            <div>
              <strong>File Quality:</strong> Higher quality input files produce better results.
            </div>
            <div>
              <strong>Processing Time:</strong> Larger files may take longer to process.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
