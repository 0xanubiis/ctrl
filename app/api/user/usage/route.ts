import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

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

    // Get user's token usage
    const { data: usage, error } = await supabase
      .from("token_usage")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching usage:", error)
      return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 })
    }

    return NextResponse.json({ usage })
  } catch (error) {
    console.error("Error in usage API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}