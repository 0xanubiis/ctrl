import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get("type") // 'tts', 'stt', 'noise_reduction'
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("audio_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (fileType) {
      query = query.eq("file_type", fileType)
    }

    const { data: files, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      files: files || [],
      pagination: {
        limit,
        offset,
        hasMore: files?.length === limit,
      },
    })
  } catch (error) {
    console.error("Files API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Delete file from database (user can only delete their own files due to RLS)
    const { error } = await supabase.from("audio_files").delete().eq("id", fileId).eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete file API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
