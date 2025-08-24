import { createRouteHandlerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { otp, email } = await request.json()

    if (!otp || !email) {
      return NextResponse.json(
        { error: "OTP and email are required" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify the OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (data.user && data.session) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Email verified successfully",
          redirectUrl: "/dashboard"
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 400 }
    )
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
