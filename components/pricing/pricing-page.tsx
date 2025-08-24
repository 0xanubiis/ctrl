"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Mic, Zap, Star, Crown, Loader2, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { SUBSCRIPTION_PLANS, formatPrice } from "@/lib/stripe"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface PricingPageProps {
  user: any
}

export default function PricingPage({ user }: PricingPageProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const planIcons = {
    free: Mic,
    pro: Zap,
    premium: Crown,
  }

  const handleCheckout = async (priceId: string, tier: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      })
      return
    }

    setLoading(tier)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

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

  // Get current user's subscription tier
  const currentTier = user?.subscription?.tier || "free"
  const hasActiveSubscription = user?.subscription?.status === "active"

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
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
              {user ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10 transition-colors">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/10 transition-colors">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Pricing Plans
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your AI audio needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([tier, plan]) => {
            const Icon = planIcons[tier as keyof typeof planIcons]
            const isCurrentPlan = currentTier === tier
            const isPopular = tier === "free"
            const isLoading = loading === tier

            return (
              <Card key={tier} className={`relative border-0 shadow-xl hover-lift transition-all duration-300 ${
                isPopular 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 scale-105 shadow-2xl' 
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
              }`}>
                {isPopular && (
                  <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                    Most popular
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      isPopular 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl mb-3">{plan.name}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && <span className="text-muted-foreground text-lg"> per month</span>}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">This includes:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            isPopular 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                              : 'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}></div>
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isCurrentPlan ? (
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg transition-all duration-300" disabled>
                      Current Plan
                    </Button>
                  ) : tier === "free" ? (
                    <Link href={user ? "/dashboard" : "/auth/signup"}>
                      <Button variant="outline" className="w-full border-2 border-primary/20 hover:bg-primary/10 transition-colors">
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => handleCheckout(plan.priceId!, tier)}
                      disabled={isLoading}
                      className={`w-full shadow-lg transition-all duration-300 ${
                        isPopular 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Subscribe`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Current Plan Management */}
        {hasActiveSubscription && (
          <div className="mt-20 text-center">
            <Card className="max-w-md mx-auto border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Manage Your Subscription</span>
                </CardTitle>
                <CardDescription className="text-base">
                  You're currently on the {SUBSCRIPTION_PLANS[currentTier as keyof typeof SUBSCRIPTION_PLANS]?.name} plan
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      <Check className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Can I change plans anytime?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">What happens if I exceed my limits?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You'll be notified when approaching limits. Upgrade anytime to continue using our services.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Is there a free trial?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our free plan lets you try all features with generous limits. No credit card required.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">How does billing work?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All plans are billed monthly. You can cancel anytime and keep access until the end of your billing
                  period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
