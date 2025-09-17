import { createClient } from "@/lib/supabase/server"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { PricingCard } from "@/components/pricing/pricing-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import Link from "next/link"

async function PricingContent() {
  const supabase = await createClient()

  // Get subscription plans
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true })

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
            <button className="cursor-pointer rounded-full px-2.5 py-1 text-foreground bg-primary text-primary-foreground">
              Monthly
            </button>
            <button className="cursor-pointer rounded-full px-2.5 py-1 text-muted-foreground">
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans?.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} billingCycle="monthly" isPopular={index === 1} />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">All plans include</h3>
          </div>
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "High-quality AI voices",
                "Fast processing",
                "Multiple file formats",
                "API access",
                "24/7 support",
                "Regular updates",
                "Secure cloud storage",
                "Usage analytics",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Frequently asked questions</h3>
          </div>
          <div className="mx-auto mt-12 max-w-2xl space-y-8">
            <div>
              <h4 className="font-semibold text-foreground">Can I change my plan anytime?</h4>
              <p className="mt-2 text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">What happens if I exceed my token limit?</h4>
              <p className="mt-2 text-muted-foreground">
                You'll be notified when you're close to your limit. You can upgrade your plan or purchase additional
                tokens.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Is there a free trial?</h4>
              <p className="mt-2 text-muted-foreground">
                Yes, all new users get 1,000 free tokens to try our service. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <div className="px-6 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div className="py-24 text-center">Loading pricing...</div>}>
        <PricingContent />
      </Suspense>
      <MarketingFooter />
    </div>
  )
}
