"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SUBSCRIPTION_PLANS, getPlanLimits } from "@/lib/stripe"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, ArrowUp, ArrowDown, X, Loader2, Sparkles, Zap, Crown, Mic } from "lucide-react"
import Link from "next/link"

interface SubscriptionManagerProps {
  user: any
  subscription: any
  usage: any
}

export default function SubscriptionManager({ user, subscription, usage }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const currentTier = subscription?.tier || "free"
  const currentPlan = SUBSCRIPTION_PLANS[currentTier]
  const limits = getPlanLimits(currentTier)

  const handleManageSubscription = async () => {
    setLoading("manage")

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create portal session")
      }
    } catch (error) {
      console.error("Portal error:", error)
      toast({
        title: "Portal Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading("manage")
    }
  }

  const handleUpgrade = async (tier: string) => {
    if (!SUBSCRIPTION_PLANS[tier]?.priceId) {
      toast({
        title: "Upgrade Error",
        description: "This plan is not available for upgrade.",
        variant: "destructive",
      })
      return
    }

    setLoading(`upgrade-${tier}`)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: SUBSCRIPTION_PLANS[tier].priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Upgrade error:", error)
      toast({
        title: "Upgrade Error",
        description: "Failed to create upgrade session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    if (limit === 0) return 100
    return Math.min((current / limit) * 100, 100)
  }

  const formatUsage = (current: number, limit: number) => {
    if (limit === -1) return `${current} (unlimited)`
    return `${current} / ${limit}`
  }

  const getAvailableUpgrades = () => {
    const upgrades = []
    if (currentTier === "free") {
      upgrades.push("pro", "premium")
    } else if (currentTier === "pro") {
      upgrades.push("premium")
    }
    return upgrades
  }

  const getAvailableDowngrades = () => {
    const downgrades = []
    if (currentTier === "premium") {
      downgrades.push("pro", "free")
    } else if (currentTier === "pro") {
      downgrades.push("free")
    }
    return downgrades
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "free": return Mic
      case "pro": return Zap
      case "premium": return Crown
      default: return Mic
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free": return "from-gray-500 to-gray-600"
      case "pro": return "from-blue-500 to-purple-500"
      case "premium": return "from-purple-500 to-pink-500"
      default: return "from-gray-500 to-gray-600"
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span>Current Plan</span>
            </div>
            <Badge variant={subscription?.status === "active" ? "default" : "secondary"} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
              {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1) || "Free"}
            </Badge>
          </CardTitle>
          <CardDescription className="text-base">
            You're currently on the <span className="font-semibold text-blue-600">{currentPlan.name}</span> plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Plan Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span>Plan:</span>
                  <span className="font-medium">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span>Price:</span>
                  <span className="font-medium">
                    {currentPlan.price === 0 ? "Free" : `$${currentPlan.price}/month`}
                  </span>
                </div>
                {subscription?.current_period_end && (
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span>Next billing:</span>
                    <span className="font-medium">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Plan Features</h4>
              <ul className="space-y-2">
                {currentPlan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {currentPlan.features.length > 3 && (
                  <li className="text-muted-foreground text-xs p-2">
                    +{currentPlan.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-blue-200/50">
            <Button
              onClick={handleManageSubscription}
              disabled={loading === "manage"}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300"
            >
              {loading === "manage" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span>Usage This Month</span>
          </CardTitle>
          <CardDescription>
            Track your usage against your plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Speech-to-Text Usage */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Speech-to-Text</span>
              <span className="text-sm text-muted-foreground">
                {formatUsage(usage?.stt_minutes || 0, limits.speechToText)}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(usage?.stt_minutes || 0, limits.speechToText)} 
              className="h-3 bg-white/50 dark:bg-gray-800/50"
            />
          </div>

          {/* Text-to-Speech Usage */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Text-to-Speech</span>
              <span className="text-sm text-muted-foreground">
                {limits.textToSpeech}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(usage?.tts_characters || 0, 100)} 
              className="h-3 bg-white/50 dark:bg-gray-800/50"
            />
          </div>

          {/* Noise Reduction Usage */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Noise Reduction</span>
              <span className="text-sm text-muted-foreground">
                {limits.noiseReduction}
              </span>
            </div>
            <Progress 
              value={limits.noiseReduction === "Unlimited" ? 0 : 50} 
              className="h-3 bg-white/50 dark:bg-gray-800/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Plan Actions */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span>Plan Actions</span>
          </CardTitle>
          <CardDescription>
            Upgrade, downgrade, or cancel your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upgrade Options */}
          {getAvailableUpgrades().length > 0 && (
            <div>
              <h4 className="font-semibold mb-4 text-green-700 flex items-center space-x-2">
                <ArrowUp className="h-4 w-4" />
                <span>Upgrade Options</span>
              </h4>
              <div className="grid gap-3">
                {getAvailableUpgrades().map((tier) => {
                  const Icon = getTierIcon(tier)
                  const colorClass = getTierColor(tier)
                  return (
                    <div key={tier} className="flex items-center justify-between p-4 border border-green-200 rounded-xl bg-white/50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{SUBSCRIPTION_PLANS[tier].name}</div>
                          <div className="text-sm text-muted-foreground">
                            {SUBSCRIPTION_PLANS[tier].price === 0 ? "Free" : `$${SUBSCRIPTION_PLANS[tier].price}/month`}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUpgrade(tier)}
                        disabled={loading === `upgrade-${tier}`}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-300"
                      >
                        {loading === `upgrade-${tier}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Upgrade
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Downgrade Options */}
          {getAvailableDowngrades().length > 0 && (
            <div>
              <h4 className="font-semibold mb-4 text-orange-700 flex items-center space-x-2">
                <ArrowDown className="h-4 w-4" />
                <span>Downgrade Options</span>
              </h4>
              <div className="grid gap-3">
                {getAvailableDowngrades().map((tier) => {
                  const Icon = getTierIcon(tier)
                  const colorClass = getTierColor(tier)
                  return (
                    <div key={tier} className="flex items-center justify-between p-4 border border-orange-200 rounded-xl bg-white/50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{SUBSCRIPTION_PLANS[tier].name}</div>
                          <div className="text-sm text-muted-foreground">
                            {SUBSCRIPTION_PLANS[tier].price === 0 ? "Free" : `$${SUBSCRIPTION_PLANS[tier].price}/month`}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUpgrade(tier)}
                        disabled={loading === `upgrade-${tier}`}
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50 shadow-lg transition-all duration-300"
                      >
                        {loading === `upgrade-${tier}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Downgrade
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cancel Subscription */}
          {subscription?.status === "active" && (
            <div className="pt-6 border-t border-red-200/50">
              <h4 className="font-semibold mb-4 text-red-700 flex items-center space-x-2">
                <X className="h-4 w-4" />
                <span>Cancel Subscription</span>
              </h4>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Cancel your subscription to stop future billing. You'll keep access until the end of your current billing period.
              </p>
              <Button
                onClick={handleManageSubscription}
                disabled={loading === "manage"}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50 shadow-lg transition-all duration-300"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/pricing" className="flex-1">
          <Button variant="outline" className="w-full border-2 border-primary/20 hover:bg-primary/10 transition-colors shadow-lg">
            View All Plans
          </Button>
        </Link>
        <Link href="/billing" className="flex-1">
          <Button variant="outline" className="w-full border-2 border-primary/20 hover:bg-primary/10 transition-colors shadow-lg">
            Billing History
          </Button>
        </Link>
      </div>
    </div>
  )
}
