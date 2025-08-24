"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Mic, Square, FileAudio, Copy, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function STTInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState("")
  const [loading, setLoading] = useState(false)
  const [translate, setTranslate] = useState(false)
  const [usage, setUsage] = useState({ current: 0, limit: 2 })
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadUsage()
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  const loadUsage = async () => {
    try {
      const response = await fetch("/api/audio/usage")
      const data = await response.json()

      if (data.success) {
        setUsage(data.usage.stt)
      }
    } catch (error) {
      console.error("Failed to load usage:", error)
    }
  }

  const startRecording = async () => {
    try {
      // Request high-quality audio with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
          sampleSize: 16,
        },
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', // Better quality than WAV
        audioBitsPerSecond: 128000, // 128 kbps for good quality
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
        setAudioFile(audioFile)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        toast({
          title: "Recording Error",
          description: "Failed to record audio. Please try again.",
          variant: "destructive",
        })
        setIsRecording(false)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second for better reliability
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Microphone access error:", error)
      toast({
        title: "Microphone Access Error",
        description: error instanceof Error && error.name === 'NotAllowedError' 
          ? "Please allow microphone access to record audio"
          : "Failed to access microphone. Please check your device settings.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
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

      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 25MB",
          variant: "destructive",
        })
        return
      }

      setAudioFile(file)
      setTranscription("")
    }
  }

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "Please upload an audio file or record audio first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTranscription("")

    try {
      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("translate", translate.toString())

      const response = await fetch("/api/audio/stt", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setTranscription(data.transcription)
        setUsage(data.usage)
        toast({
          title: "Success",
          description: translate ? "Audio translated successfully!" : "Audio transcribed successfully!",
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription)
    toast({
      title: "Copied",
      description: "Transcription copied to clipboard",
    })
  }

  const downloadTranscription = () => {
    const blob = new Blob([transcription], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `transcription-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const usagePercentage = usage.limit === -1 ? 0 : (usage.current / usage.limit) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Interface */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileAudio className="h-5 w-5" />
              <span>Audio Input</span>
            </CardTitle>
            <CardDescription>Upload a file or record audio directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <Label>Upload Audio File</Label>
              <div className="mt-2">
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isRecording}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Audio File
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: MP3, MP4, WAV, WebM, OGG (max 25MB)
              </p>
            </div>

            {/* Recording */}
            <div className="border-t pt-6">
              <Label>Record Audio</Label>
              <div className="mt-2 flex items-center space-x-4">
                {!isRecording ? (
                  <Button onClick={startRecording} variant="outline" disabled={loading}>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording ({formatTime(recordingTime)})
                  </Button>
                )}
              </div>
            </div>

            {/* Selected File Info */}
            {audioFile && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center space-x-3">
                  <FileAudio className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex items-center space-x-2">
              <Switch id="translate" checked={translate} onCheckedChange={setTranslate} />
              <Label htmlFor="translate">Translate to English</Label>
            </div>

            <Button onClick={handleTranscribe} disabled={loading || !audioFile} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : translate ? (
                "Translate Audio"
              ) : (
                "Transcribe Audio"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Transcription Result */}
        {transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription Result</CardTitle>
              <CardDescription>Your audio has been converted to text</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={transcription} readOnly className="min-h-32 mb-4" />
              <div className="flex space-x-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={downloadTranscription} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
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
              {usage.current} / {usage.limit === -1 ? "∞" : usage.limit} transcriptions used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={usagePercentage} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {usage.limit === -1 ? "Unlimited usage" : `${usage.limit - usage.current} transcriptions remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Audio Quality:</strong> Clear audio with minimal background noise produces better results.
            </div>
            <div>
              <strong>File Size:</strong> Maximum file size is 25MB. Compress large files if needed.
            </div>
            <div>
              <strong>Translation:</strong> Enable translation to convert non-English audio to English text.
            </div>
            <div>
              <strong>Recording:</strong> Speak clearly and at a moderate pace for best results.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
