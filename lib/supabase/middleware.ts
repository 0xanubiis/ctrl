// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getUserTier } from "@/lib/subscription"

export async function middleware(req: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Create Supabase client with middleware-specific cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.set(name, "", { ...options, maxAge: 0 })
        },
      },
    }
  )

  // Get user from Supabase
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error("Auth error in middleware:", userError)
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Get user tier
  let tier = "free"
  try {
    tier = await getUserTier(user.id)
  } catch (error) {
    console.error("Error getting user tier:", error)
  }

  // Redirect free users trying to access pro content
  if (req.nextUrl.pathname.startsWith("/pro") && tier === "free") {
    return NextResponse.redirect(new URL("/upgrade", req.url))
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/pro/:path*"],
}