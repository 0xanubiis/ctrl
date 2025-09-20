import { createClient } from "@/lib/supabase/server"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import Link from "next/link"
import { PricingContent } from "@/components/pricing/pricing-content"

async function PricingData() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .neq("id", "free")
    .order("price_monthly", { ascending: true })

  return <PricingContent plans={plans || []} />
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
        <PricingData />
      </Suspense>

      <MarketingFooter />
    </div>
  )
}