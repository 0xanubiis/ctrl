import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fileId = params.id

    // Verify the file belongs to the user
    const { data: file, error: fetchError } = await supabase
      .from("audio_files")
      .select("user_id")
      .eq("id", fileId)
      .single()

    if (fetchError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    if (file.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the file
    const { error: deleteError } = await supabase
      .from("audio_files")
      .delete()
      .eq("id", fileId)

    if (deleteError) {
      console.error("Error deleting file:", deleteError)
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete file API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
