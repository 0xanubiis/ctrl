import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") // 'tts', 'stt', 'voice_clone'

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase
      .from("audio_files")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (type) {
      // Filter by usage logs to get files of specific type
      const { data: usageLogs } = await supabase
        .from("usage_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("usage_type", type)

      if (usageLogs) {
        const logIds = usageLogs.map((log) => log.id)
        query = query.in("usage_log_id", logIds)
      }
    }

    const { data: files, error, count } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error("Error fetching files:", error)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in files API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
