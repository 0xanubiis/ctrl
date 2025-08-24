import { getCurrentUser, getUserSubscription, getUserUsage } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardPage from "@/components/dashboard/dashboard-page"

export default async function DashboardPageRoute() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const subscription = await getUserSubscription(user.id)
  const usage = await getUserUsage(user.id)

  return <DashboardPage user={user} subscription={subscription} usage={usage} />
}
