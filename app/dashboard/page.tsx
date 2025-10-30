"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Volume2, Mic, Users, FileAudio, TrendingUp, Clock, Zap, RefreshCw, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [tokenUsage, setTokenUsage] = useState<any[]>([])
  const [recentFiles, setRecentFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasShownSuccess, setHasShownSuccess] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    
    // Listen for refresh events
    const handleRefresh = () => {
      fetchDashboardData()
    }
    
    window.addEventListener('dashboard:refresh', handleRefresh)
    
    // Check for URL parameters indicating plan change
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true' || urlParams.get('plan_changed') === 'true') {
      // Refresh dashboard after successful plan change
      setTimeout(() => {
        fetchDashboardData(true) // Pass true to show toast
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard')
      }, 500)
    }
    
    return () => {
      window.removeEventListener('dashboard:refresh', handleRefresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboardData = async (showToast = false) => {
    setLoading(true)
    try {
      // Fetch usage data which includes subscription and token usage
      const usageResponse = await fetch("/api/user/usage")
      const usageData = await usageResponse.json()
      
      if (usageResponse.ok) {
        const previousPlan = subscription?.subscription_plans?.name
        const previousTokens = subscription?.subscription_plans?.tokens_per_month
        
        // Update subscription data
        if (usageData.subscription) {
          setSubscription(usageData.subscription)
          
          // Show success message if plan changed
          if (showToast && previousPlan && usageData.subscription.subscription_plans) {
            const newPlan = usageData.subscription.subscription_plans.name
            const newTokens = usageData.subscription.subscription_plans.tokens_per_month
            
            if (newPlan !== previousPlan || newTokens !== previousTokens) {
              toast.success(`Plan updated to ${newPlan}!`, {
                description: `You now have ${newTokens} tokens per month.`,
              })
              setHasShownSuccess(true)
            }
          }
        }
        
        // Update token usage data
        if (usageData.tokenUsage) {
          setTokenUsage(usageData.tokenUsage)
        }
      }

      // Fetch recent files
      const filesResponse = await fetch("/api/user/files")
      const filesData = await filesResponse.json()
      if (filesResponse.ok && filesData.files) {
        setRecentFiles(filesData.files.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      if (showToast) {
        toast.error("Failed to update dashboard", {
          description: "Please refresh the page manually.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const totalTokensUsed = tokenUsage?.reduce((sum, usage) => sum + usage.tokens_used, 0) || 0
  
  // Set token limits based on plan
  const getTokenLimit = () => {
    const planName = subscription?.subscription_plans?.name?.toLowerCase() || "free"
    switch (planName) {
      case "free":
        return 25
      case "starter":
        return 100
      case "pro":
        return 250
      case "premium":
        return 500
      case "enterprise":
        return 1000
      default:
        return 25
    }
  }
  
  const totalTokensAvailable = getTokenLimit()
  const usagePercentage = (totalTokensUsed / totalTokensAvailable) * 100

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create billing portal session")
      }

      const { url } = await response.json()
      
      if (url) {
        // Store a flag to indicate we're going to billing portal
        sessionStorage.setItem('returning_from_billing', 'true')
        window.location.href = url
      }
    } catch (error) {
      console.error("Error opening billing portal:", error)
      alert("Failed to open billing portal. Please try again.")
    }
  }

  useEffect(() => {
    // Check if user is returning from billing portal
    const returningFromBilling = sessionStorage.getItem('returning_from_billing')
    if (returningFromBilling === 'true') {
      sessionStorage.removeItem('returning_from_billing')
      // Delay refresh to ensure webhook has processed
      setTimeout(() => {
        fetchDashboardData(true) // Pass true to show toast
      }, 2000)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 border-b-2 border-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Ready to create amazing audio content with AI?</p>
        </div>
        <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
          {subscription?.subscription_plans?.name || "Free"} Plan
        </Badge>
      </div>

      {/* Usage Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Token Usage This Month
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchDashboardData}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            {totalTokensUsed.toLocaleString()} of {totalTokensAvailable.toLocaleString()} tokens used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={usagePercentage} className="mb-2" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            {Math.round(usagePercentage)}% used • {(totalTokensAvailable - totalTokensUsed).toLocaleString()} tokens
            remaining
          </p>
          
          {/* Plan Change Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
            <Button
              asChild
              variant="default"
              size="sm"
              className="flex-1"
            >
              <Link href="/pricing" className="flex items-center justify-center gap-2">
                <ArrowUp className="w-4 h-4" />
                Upgrade Plan
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleManageBilling}
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/dashboard/text-to-speech">Start</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base sm:text-lg">Text to Speech</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Convert text into natural-sounding speech</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/dashboard/speech-to-text">Start</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base sm:text-lg">Speech to Text</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Transcribe audio files to accurate text</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/dashboard/voice-cloning">Start</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base sm:text-lg">Voice Cloning</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Create custom AI voices from samples</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <FileAudio className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <Button asChild size="sm" variant="outline" className="text-xs sm:text-sm">
                <Link href="/dashboard/files">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base sm:text-lg">Audio Files</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage your generated audio content</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Recent Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentFiles && recentFiles.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <FileAudio className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs sm:text-sm shrink-0">
                      Play
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">No files yet. Create your first audio file!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {tokenUsage?.map((usage) => (
                <div key={usage.usage_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {usage.usage_type === "tts" && <Volume2 className="w-4 h-4" />}
                    {usage.usage_type === "stt" && <Mic className="w-4 h-4" />}
                    {usage.usage_type === "voice_clone" && <Users className="w-4 h-4" />}
                    <span className="text-sm capitalize">{usage.usage_type.replace("_", " ")}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm sm:text-base">{usage.tokens_used.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">tokens used</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
