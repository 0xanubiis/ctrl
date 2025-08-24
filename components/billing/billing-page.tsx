"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Calendar, DollarSign, FileText, ArrowRight, Loader2, Sparkles, Zap, Crown, Mic, Clock, Receipt } from "lucide-react"
import Link from "next/link"

interface BillingPageProps {
  user: any
  subscription: any
}

export default function BillingPage({ user, subscription }: BillingPageProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const currentTier = subscription?.tier || "free"
  const currentPlan = SUBSCRIPTION_PLANS[currentTier]

  const handleManageSubscription = async () => {
    setLoading(true)

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
      setLoading(false)
    }
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

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Header */}
        <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AAS</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10 transition-colors">Dashboard</Button>
                </Link>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    View Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CreditCard className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-6">No Active Subscription</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              You don't have an active subscription yet. Choose a plan to get started with our AI audio tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift">
                  <Sparkles className="mr-2 h-5 w-5" />
                  View Pricing Plans
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="border-2 border-primary/20 hover:bg-primary/10 transition-colors">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AAS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10 transition-colors">Dashboard</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10 transition-colors">Pricing</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Billing & Subscription</h1>
              <p className="text-muted-foreground text-lg">Manage your subscription and billing information</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span>Current Plan</span>
                </CardTitle>
                <CardDescription>
                  Your active subscription details and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Plan Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-sm">Plan Name:</span>
                        <span className="font-medium">{currentPlan.name}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-sm">Monthly Price:</span>
                        <span className="font-medium">
                          {currentPlan.price === 0 ? "Free" : `$${currentPlan.price}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-sm">Status:</span>
                        <Badge variant={subscription.status === "active" ? "default" : "secondary"} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                          {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Billing Details</h4>
                    <div className="space-y-3">
                      {subscription.current_period_start && (
                        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-sm">Current Period:</span>
                          <span className="font-medium text-xs text-right">
                            {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {subscription.current_period_end && (
                        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-sm">Next Billing:</span>
                          <span className="font-medium">
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-sm">Auto-Renewal:</span>
                        <span className="font-medium">
                          {subscription.cancel_at_period_end ? "Disabled" : "Enabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-blue-200/50">
                  <Button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300"
                  >
                    {loading ? (
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
          </div>

          {/* Plan Features */}
          <div>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span>Plan Features</span>
                </CardTitle>
                <CardDescription>
                  What's included in your {currentPlan.name} plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2"></div>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Billing History */}
        <div className="mt-12">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <span>Billing History</span>
              </CardTitle>
              <CardDescription>
                Your recent invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Receipt className="h-10 w-10 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No billing history yet</h3>
                <p className="text-sm mb-4">Your invoices will appear here once you have billing activity</p>
                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:bg-primary/10"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Billing Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Link href="/pricing">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">View All Plans</h3>
                <p className="text-sm text-muted-foreground">Compare plans and upgrade options</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift cursor-pointer bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Back to Dashboard</h3>
                <p className="text-sm text-muted-foreground">Continue using your AI audio tools</p>
              </CardContent>
            </Card>
          </Link>

          <div>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">Contact our support team</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
