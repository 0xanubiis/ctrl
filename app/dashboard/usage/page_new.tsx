"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Volume2, Mic, Users, BarChart3, TrendingUp, Calendar, Zap, AlertCircle, Clock, Download, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UsageData {
  tokens_used: number
  tokens_remaining: number
  usage_type: string
  reset_date: string
}

interface UsageLog {
  id: string
  usage_type: string
  tokens_consumed: number
  input_text?: string
  output_url?: string
  voice_id?: string
  model_used?: string
  quality_setting?: string
  metadata: any
  created_at: string
}

interface SubscriptionData {
  plan_name: string
  tokens_per_month: number
  billing_cycle: string
  current_period_end: string
}

export default function UsagePage() {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/user/usage")
      const data = await response.json()

      if (response.ok) {
        setUsageData(data.usage || [])
        setUsageLogs(data.usageLogs || [])
        setSubscription(data.subscription)
      } else {
        setError(data.error || "Failed to fetch usage data")
      }
    } catch (error) {
      setError("Network error occurred")
      console.error("Error fetching usage data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUsageIcon = (usageType: string) => {
    switch (usageType) {
      case "tts":
        return <Volume2 className="w-5 h-5" />
      case "stt":
        return <Mic className="w-5 h-5" />
      case "voice_clone":
        return <Users className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getUsageTypeName = (usageType: string) => {
    switch (usageType) {
      case "tts":
        return "Text to Speech"
      case "stt":
        return "Speech to Text"
      case "voice_clone":
        return "Voice Cloning"
      default:
        return usageType
    }
  }

  const getUsageTypeColor = (usageType: string) => {
    switch (usageType) {
      case "tts":
        return "text-blue-600"
      case "stt":
        return "text-green-600"
      case "voice_clone":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const getNextRefillDate = () => {
    if (!subscription?.current_period_end) return null
    return new Date(subscription.current_period_end)
  }

  const getDaysUntilRefill = () => {
    const refillDate = getNextRefillDate()
    if (!refillDate) return null
    
    const now = new Date()
    const diffInMs = refillDate.getTime() - now.getTime()
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
    return diffInDays
  }

  const totalTokensUsed = usageData.reduce((sum, usage) => sum + usage.tokens_used, 0)
  const totalTokensAvailable = subscription?.tokens_per_month || 25
  const usagePercentage = (totalTokensUsed / totalTokensAvailable) * 100

  const downloadUsageReport = () => {
    const report = {
      subscription: subscription,
      usage_summary: usageData,
      detailed_logs: usageLogs,
      generated_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `usage-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usage & Analytics</h1>
          <p className="text-muted-foreground">Track your token usage and analytics</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading usage data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usage & Analytics</h1>
          <p className="text-muted-foreground">Track your token usage and analytics</p>
        </div>
        <Button onClick={downloadUsageReport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokensUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">out of {totalTokensAvailable.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usage Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</div>
            <Progress value={usagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription?.plan_name || "Free"}</div>
            <p className="text-xs text-muted-foreground capitalize">{subscription?.billing_cycle || "monthly"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Refill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDaysUntilRefill() || "N/A"}</div>
            <p className="text-xs text-muted-foreground">days remaining</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Usage</TabsTrigger>
          <TabsTrigger value="refill">Token Refill</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Usage by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Usage by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageData.map((usage) => {
                  const typePercentage = (usage.tokens_used / totalTokensUsed) * 100
                  return (
                    <div key={usage.usage_type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getUsageIcon(usage.usage_type)}
                          <span className="font-medium">{getUsageTypeName(usage.usage_type)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{usage.tokens_used.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground ml-1">tokens</span>
                        </div>
                      </div>
                      <Progress value={typePercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {typePercentage.toFixed(1)}% of total usage
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your last 20 usage activities</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLogs.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No usage logs found</h3>
                  <p className="text-muted-foreground">Start using our AI features to see detailed logs here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usageLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-muted ${getUsageTypeColor(log.usage_type)}`}>
                          {getUsageIcon(log.usage_type)}
                        </div>
                        <div>
                          <div className="font-medium">{getUsageTypeName(log.usage_type)}</div>
                          {log.input_text && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {log.input_text}
                            </div>
                          )}
                          {log.voice_id && (
                            <div className="text-xs text-muted-foreground">
                              Voice: {log.voice_id}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{log.tokens_consumed} tokens</div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(log.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refill" className="space-y-6">
          {/* Token Refill Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Token Refill Information
              </CardTitle>
              <CardDescription>When your tokens will be refilled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscription ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Current Subscription</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan:</span>
                          <span className="font-medium">{subscription.plan_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Billing Cycle:</span>
                          <span className="font-medium capitalize">{subscription.billing_cycle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tokens per Period:</span>
                          <span className="font-medium">{subscription.tokens_per_month.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Next Refill</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Days Remaining:</span>
                          <span className="font-medium">{getDaysUntilRefill()} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {getDaysUntilRefill() && getDaysUntilRefill()! <= 7 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your tokens will be refilled in {getDaysUntilRefill()} day{getDaysUntilRefill() !== 1 ? 's' : ''}. 
                        You have {totalTokensAvailable - totalTokensUsed} tokens remaining.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    You're currently on the free plan with {totalTokensAvailable} tokens per month.
                  </p>
                  <Button asChild>
                    <a href="/pricing">Upgrade Plan</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
