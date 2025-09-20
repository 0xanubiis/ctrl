"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingCardProps {
  plan: {
    id: string
    name: string
    description: string
    price_monthly: number
    price_yearly: number
    tokens_per_month: number
    features: string[]
    stripe_price_id_monthly?: string
    stripe_price_id_yearly?: string
    is_active: boolean
  }
  billingCycle: "monthly" | "yearly"
  isPopular?: boolean
  currentPlan?: string
}

export function PricingCard({ plan, billingCycle, isPopular, currentPlan }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly
  const priceId = billingCycle === "yearly" ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly
  const isCurrentPlan = currentPlan === plan.id
  const isFree = plan.id === "free"

  const handleSubscribe = async () => {
    if (isFree || !priceId) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          planId: plan.id,
          billingCycle,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}>
      {isPopular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">${(price / 100).toFixed(0)}</span>
          <span className="text-muted-foreground">/{billingCycle === "yearly" ? "year" : "month"}</span>
        </div>
        <p className="text-sm text-muted-foreground">{plan.tokens_per_month.toLocaleString()} tokens per month</p>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan || !plan.is_active}
          variant={isCurrentPlan ? "outline" : "default"}
        >
          {isLoading ? "Loading..." : isCurrentPlan ? "Current Plan" : isFree ? "Get Started" : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  )
}

