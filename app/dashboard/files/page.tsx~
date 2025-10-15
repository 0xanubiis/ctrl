"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileAudio, Play, Download, Trash2, Search, Filter, Calendar, Clock, Users, Mic, Copy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AudioFile {
  id: string
  filename: string
  original_text?: string
  voice_id?: string
  file_url: string
  file_size: number
  duration_seconds: number
  quality: string
  format: string
  created_at: string
  usage_type: string
}

interface VoiceClone {
  id: string
  name: string
  description: string
  voice_id: string
  sample_audio_url: string
  status: string
  created_at: string
  metadata: any
}

export default function AudioFilesPage() {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [voiceClones, setVoiceClones] = useState<VoiceClone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
    fetchVoiceClones()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/user/files")
      const data = await response.json()
      
      if (response.ok) {
        setFiles(data.files || [])
      } else {
        setError(data.error || "Failed to fetch files")
      }
    } catch (error) {
      setError("Network error occurred")
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVoiceClones = async () => {
    try {
      const response = await fetch("/api/user/voice-clones")
      const data = await response.json()
      
      if (response.ok) {
        setVoiceClones(data.voiceClones || [])
      } else {
        console.error("Failed to fetch voice clones:", data.error)
      }
    } catch (error) {
      console.error("Error fetching voice clones:", error)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const response = await fetch(`/api/user/files/${fileId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles(files.filter(file => file.id !== fileId))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete file")
      }
    } catch (error) {
      setError("Network error occurred")
      console.error("Error deleting file:", error)
    }
  }

  const downloadFile = (file: AudioFile) => {
    const link = document.createElement("a")
    link.href = file.file_url
    link.download = file.filename
    link.click()
  }

  const downloadAllFiles = () => {
    files.forEach(file => {
      setTimeout(() => downloadFile(file), 100) // Small delay to prevent browser blocking
    })
  }

  const playFile = (file: AudioFile) => {
    const audio = new Audio(file.file_url)
    audio.play()
  }

  const copyVoiceId = (voiceId: string) => {
    navigator.clipboard.writeText(voiceId)
    // You could add a toast notification here
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getUsageTypeBadge = (type: string) => {
    const badges = {
      tts: { label: "TTS", variant: "default" as const },
      stt: { label: "STT", variant: "secondary" as const },
      voice_clone: { label: "Voice Clone", variant: "outline" as const },
    }
    return badges[type as keyof typeof badges] || { label: type, variant: "outline" as const }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      training: { label: "Training", variant: "secondary" as const },
      ready: { label: "Ready", variant: "default" as const },
      failed: { label: "Failed", variant: "destructive" as const },
    }
    return badges[status as keyof typeof badges] || { label: status, variant: "outline" as const }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.original_text?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || file.usage_type === filterType
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audio Files & Voices</h1>
          <p className="text-muted-foreground">Manage your generated audio content and custom voices</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audio Files & Voices</h1>
        <p className="text-muted-foreground">Manage your generated audio content and custom voices</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="files" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileAudio className="w-4 h-4" />
            Audio Files ({files.length})
          </TabsTrigger>
          <TabsTrigger value="voices" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Voice Clones ({voiceClones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          {/* Search and Filter for Files */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="tts">Text to Speech</option>
                    <option value="stt">Speech to Text</option>
                    <option value="voice_clone">Voice Clone</option>
                  </select>
                  {files.length > 0 && (
                    <Button onClick={downloadAllFiles} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Grid */}
          {filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No files found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== "all" 
                      ? "Try adjusting your search or filter criteria." 
                      : "Start by generating some audio content using our tools."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredFiles.map((file) => {
                const usageBadge = getUsageTypeBadge(file.usage_type)
                return (
                  <Card key={file.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{file.filename}</h3>
                            <Badge variant={usageBadge.variant}>{usageBadge.label}</Badge>
                          </div>
                          {file.original_text && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {file.original_text}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(file.duration_seconds)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Filter className="w-4 h-4" />
                              {formatFileSize(file.file_size)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(file.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playFile(file)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="voices" className="space-y-6">
          {/* Voice Clones Grid */}
          {voiceClones.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No voice clones found</h3>
                  <p className="text-muted-foreground">
                    Create your first custom voice using the Voice Cloning tool.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {voiceClones.map((voice) => {
                const statusBadge = getStatusBadge(voice.status)
                return (
                  <Card key={voice.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{voice.name}</h3>
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          </div>
                          {voice.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {voice.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(voice.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {voice.voice_id}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyVoiceId(voice.voice_id)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {voice.sample_audio_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const audio = new Audio(voice.sample_audio_url)
                                audio.play()
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {voice.sample_audio_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement("a")
                                link.href = voice.sample_audio_url
                                link.download = `${voice.name}_sample.mp3`
                                link.click()
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
