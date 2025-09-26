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

    // Get user's audio files
    const { data: files, error } = await supabase
      .from("audio_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching files:", error)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error in files API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}