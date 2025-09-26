import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { voiceId: string } }) {
  try {
    const { voiceId } = params

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get voice clone details
    const { data: voiceClone, error } = await supabase
      .from("voice_clones")
      .select("*")
      .eq("voice_id", voiceId)
      .eq("user_id", user.id)
      .single()

    if (error || !voiceClone) {
      return NextResponse.json({ error: "Voice clone not found" }, { status: 404 })
    }

    return NextResponse.json(voiceClone)
  } catch (error) {
    console.error("Error fetching voice clone:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { voiceId: string } }) {
  try {
    const { voiceId } = params

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete voice clone
    const { error } = await supabase.from("voice_clones").delete().eq("voice_id", voiceId).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting voice clone:", error)
      return NextResponse.json({ error: "Failed to delete voice clone" }, { status: 500 })
    }

    return NextResponse.json({ message: "Voice clone deleted successfully" })
  } catch (error) {
    console.error("Error deleting voice clone:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
