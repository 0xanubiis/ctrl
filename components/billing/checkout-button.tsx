"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CheckoutButtonProps {
  priceId: string
  tier: string
  planName: string
  isLoggedIn: boolean
}

export default function CheckoutButton({ priceId, tier, planName, isLoggedIn }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push("/auth/signup")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          tier,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        console.error("Checkout error:", error)
        return
      }

      // Redirect to Stripe Checkout
      const stripe = (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      const stripeInstance = await stripe
      await stripeInstance?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error("Checkout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        `Upgrade to ${planName}`
      )}
    </Button>
  )
}
