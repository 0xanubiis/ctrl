"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Activity, FileAudio, TrendingUp } from "lucide-react"

interface AdminStats {
  users: {
    total: number
    admin: number
    regular: number
    recent: number
  }
  subscriptions: {
    total: number
    active: number
    canceled: number
    by_tier: {
      free: number
      starter: number
      pro: number
      enterprise: number
    }
  }
  usage: {
    tts: number
    stt: number
    noise_reduction: number
  }
  audio: {
    total: number
    by_type: {
      tts: number
      stt: number
      noise_reduction: number
    }
    total_size: number
  }
  growth: {
    new_users: number
    new_subscriptions: number
    new_files: number
  }
}

export default function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to load admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div>Failed to load statistics</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats.growth.new_users} this month
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.subscriptions.active.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats.growth.new_subscriptions} this month
          </div>
        </CardContent>
      </Card>

      {/* Total Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">API Calls This Month</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.usage.tts + stats.usage.stt + stats.usage.noise_reduction).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            TTS: {stats.usage.tts} | STT: {stats.usage.stt} | NR: {stats.usage.noise_reduction}
          </div>
        </CardContent>
      </Card>

      {/* Audio Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
          <FileAudio className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.audio.total.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            {formatBytes(stats.audio.total_size)} total
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
