import { NextRequest, NextResponse } from "next/server"
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

    const { data: voiceClones, error } = await supabase
      .from("voice_clones")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching voice clones:", error)
      return NextResponse.json({ error: "Failed to fetch voice clones" }, { status: 500 })
    }

    return NextResponse.json({ voiceClones })
  } catch (error) {
    console.error("Error in voice clones API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
