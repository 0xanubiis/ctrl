import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export interface SubscriptionPlan {
  name: string
  description: string
  price: number
  priceId?: string
  features: string[]
  limits: {
    noiseReduction: string
    speechToText: number // minutes per month
    textToSpeech: string
    audioRecording: boolean
    exportTools: boolean
    priorityAccess: boolean
    multiUserSupport: boolean
  }
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    name: "Free",
    description: "Start for free with basic AI audio tools. Includes limited noise cancellation, basic text-to-speech voices, and short audio-to-text conversions. Perfect for testing the platform before upgrading.",
    price: 0,
    features: [
      "Limited noise reduction (short audio clips)",
      "20 minutes of speech-to-text per month",
      "Basic text-to-speech voices"
    ],
    limits: {
      noiseReduction: "Limited (short audio clips)",
      speechToText: 20,
      textToSpeech: "Basic voices only",
      audioRecording: false,
      exportTools: false,
      priorityAccess: false,
      multiUserSupport: false
    }
  },
  pro: {
    name: "Pro",
    description: "Unlock the full power of AI audio. Enjoy unlimited noise reduction, premium text-to-speech voices, and up to 5 hours of speech-to-text each month. Includes high-quality audio recording and exporting tools.",
    price: 15,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      "Unlimited noise reduction",
      "5 hours of speech-to-text per month",
      "Premium text-to-speech voices",
      "Audio recording & export"
    ],
    limits: {
      noiseReduction: "Unlimited",
      speechToText: 300, // 5 hours = 300 minutes
      textToSpeech: "Premium voices",
      audioRecording: true,
      exportTools: true,
      priorityAccess: false,
      multiUserSupport: false
    }
  },
  premium: {
    name: "Premium",
    description: "Designed for professionals and teams who need scale. Get everything in Pro, plus 20 hours of speech-to-text, priority API access for faster processing, and multi-user support for collaboration.",
    price: 30,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Everything in Pro",
      "20 hours of speech-to-text per month",
      "Priority API access (faster processing)",
      "Multi-user support (team accounts)"
    ],
    limits: {
      noiseReduction: "Unlimited",
      speechToText: 1200, // 20 hours = 1200 minutes
      textToSpeech: "Premium voices",
      audioRecording: true,
      exportTools: true,
      priorityAccess: true,
      multiUserSupport: true
    }
  }
}

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS

// Helper functions
export function formatPrice(price: number): string {
  if (price === 0) return "Free"
  return `$${price}`
}

export function getPlanByPriceId(priceId: string): string | null {
  for (const [tier, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return tier
    }
  }
  return null
}

export function getPlanLimits(tier: string) {
  return SUBSCRIPTION_PLANS[tier]?.limits || SUBSCRIPTION_PLANS.free.limits
}
