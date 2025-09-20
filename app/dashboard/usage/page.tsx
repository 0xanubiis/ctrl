"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Volume2, Mic, Users, BarChart3, TrendingUp, Calendar, Zap, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UsageData {
  tokens_used: number
  tokens_remaining: number
  usage_type: string
  reset_date: string
}

interface SubscriptionData {
  plan_name: string
  tokens_per_month: number
  billing_cycle: string
  current_period_end: string
}

export default function UsagePage() {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const [usageResponse, subscriptionResponse] = await Promise.all([
        fetch("/api/user/usage"),
        fetch("/api/user/subscription")
      ])

      const usageData = await usageResponse.json()
      const subscriptionData = await subscriptionResponse.json()

      if (usageResponse.ok) {
        setUsageData(usageData.usage || [])
      } else {
        setError(usageData.error || "Failed to fetch usage data")
      }

      if (subscriptionResponse.ok) {
        setSubscription(subscriptionData.subscription)
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

  const totalTokensUsed = usageData.reduce((sum, usage) => sum + usage.tokens_used, 0)
  const totalTokensAvailable = subscription?.tokens_per_month || 1000
  const usagePercentage = (totalTokensUsed / totalTokensAvailable) * 100

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Usage & Analytics</h1>
        <p className="text-muted-foreground">Track your token usage and analytics</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Overview */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-primary">{subscription.plan_name}</div>
                <div className="text-sm text-muted-foreground">Current Plan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{subscription.tokens_per_month.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Tokens per {subscription.billing_cycle}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Renews on</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Overall Usage
          </CardTitle>
          <CardDescription>
            {totalTokensUsed.toLocaleString()} of {totalTokensAvailable.toLocaleString()} tokens used this period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Token Usage</span>
                <span>{Math.round(usagePercentage)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{totalTokensUsed.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Used</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{(totalTokensAvailable - totalTokensUsed).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage by Feature */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Feature</CardTitle>
          <CardDescription>Breakdown of token usage across different AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageData.map((usage) => {
              const featurePercentage = (usage.tokens_used / totalTokensAvailable) * 100
              return (
                <div key={usage.usage_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getUsageIcon(usage.usage_type)}
                      <span className="font-medium">{getUsageTypeName(usage.usage_type)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{usage.tokens_used.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">tokens used</div>
                    </div>
                  </div>
                  <Progress value={featurePercentage} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{usage.tokens_remaining.toLocaleString()} remaining</span>
                    <span>Resets {new Date(usage.reset_date).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent AI audio generation activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usageData.map((usage) => (
              <div key={usage.usage_type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getUsageIcon(usage.usage_type)}
                  <div>
                    <div className="font-medium">{getUsageTypeName(usage.usage_type)}</div>
                    <div className="text-sm text-muted-foreground">
                      Last used: {new Date(usage.reset_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{usage.tokens_used.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">tokens</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {usagePercentage > 80 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Running Low on Tokens
            </CardTitle>
            <CardDescription>
              You've used {Math.round(usagePercentage)}% of your monthly tokens. Consider upgrading your plan for more capacity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/pricing">Upgrade Plan</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
