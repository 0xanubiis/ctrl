import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check database connection
    const supabase = await createClient()
    const { error } = await supabase.from("profiles").select("id").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Service unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
