import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    const offset = (page - 1) * limit

    let query = supabase
      .from("profiles")
      .select(
        `
        *,
        subscriptions (
          tier,
          status,
          current_period_end
        )
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq("role", role)
    }

    const { data: users, error } = await query

    if (error) {
      throw error
    }

    // Get total count for pagination
    let countQuery = supabase.from("profiles").select("*", { count: "exact", head: true })

    if (search) {
      countQuery = countQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    if (role) {
      countQuery = countQuery.eq("role", role)
    }

    const { count } = await countQuery

    return NextResponse.json({
      success: true,
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Prevent admins from demoting themselves
    if (userId === user.id && updates.role && updates.role !== "admin") {
      return NextResponse.json({ error: "Cannot change your own admin role" }, { status: 400 })
    }

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      user: data,
    })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
