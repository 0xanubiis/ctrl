import { getCurrentUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PricingPage from "@/components/pricing/pricing-page"

export default async function PricingPageRoute() {
  const user = await getCurrentUser()

  return <PricingPage user={user} />
}
