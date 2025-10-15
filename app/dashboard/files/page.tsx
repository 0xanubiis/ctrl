"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileAudio, Play, Download, Trash2, Search, Filter, Calendar, Clock, Users, Mic } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState<"files" | "voices">("files")

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

  const playFile = (file: AudioFile) => {
    const audio = new Audio(file.file_url)
    audio.play()
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
          <h1 className="text-3xl font-bold text-foreground">Audio Files</h1>
          <p className="text-muted-foreground">Manage your generated audio content</p>
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
        <h1 className="text-3xl font-bold text-foreground">Audio Files</h1>
        <p className="text-muted-foreground">Manage your generated audio content</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
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
                <option value="voice_clone">Voice Cloning</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" 
                ? "No files match your search criteria" 
                : "You haven't generated any audio files yet. Start by using our AI tools!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{file.filename}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {file.usage_type.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {file.quality}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {file.original_text && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {file.original_text}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(file.duration_seconds)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(file.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.file_size)} • {file.format.toUpperCase()}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playFile(file)}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(file)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{files.length}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatFileSize(files.reduce((sum, file) => sum + file.file_size, 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatDuration(files.reduce((sum, file) => sum + file.duration_seconds, 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {files.filter(f => f.usage_type === "tts").length}
                </div>
                <div className="text-sm text-muted-foreground">TTS Files</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
