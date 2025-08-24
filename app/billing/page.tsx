import { getCurrentUser, getUserSubscription } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import BillingPage from "@/components/billing/billing-page"

export default async function BillingPageRoute() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const subscription = await getUserSubscription(user.id)

  return <BillingPage user={user} subscription={subscription} />
}
