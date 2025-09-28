"use client"

import { useState } from "react"
import { PricingCard } from "@/components/pricing/pricing-card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface PricingContentProps {
  plans: any[]
}

export function PricingContent({ plans }: PricingContentProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Choose the perfect plan for your needs
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Start free and scale as you grow. All plans include our core AI audio features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-16 flex justify-center">
          <div className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-border">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`cursor-pointer rounded-full px-2.5 py-1 ${
                billingCycle === "monthly" 
                  ? "text-primary-foreground bg-primary" 
                  : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`cursor-pointer rounded-full px-2.5 py-1 ${
                billingCycle === "yearly" 
                  ? "text-primary-foreground bg-primary" 
                  : "text-muted-foreground"
              }`}
            >
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isPopular={plan.id === "pro"}
            />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">All plans include</h3>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to create amazing audio content with AI
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Text to Speech</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Convert any text into natural-sounding speech with multiple AI voices
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Speech to Text</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Transcribe audio files with high accuracy and multiple language support
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Voice Cloning</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create custom AI voices from your voice samples
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">High Quality Audio</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Professional-grade audio output with multiple quality options
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">File Management</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Organize and manage all your generated audio files
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">API Access</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Integrate our AI audio features into your applications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
