import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching subscription:", error)
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error in subscription API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
