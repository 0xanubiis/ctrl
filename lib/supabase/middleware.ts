import { createMiddlewareClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  // Check if Supabase environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    return response
  }

  const supabase = createMiddlewareClient(
    { req: request, res: response },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  )

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error in middleware:', authError)
      // Continue without user if auth fails
    }

    // Protect /admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }

      try {
        const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin", {
          user_uuid: user.id,
        })

        if (adminError) {
          console.error('Admin check error:', adminError)
          // If admin check fails, redirect to dashboard for safety
          const url = request.nextUrl.clone()
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }

        if (!isAdmin) {
          const url = request.nextUrl.clone()
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }
      } catch (rpcError) {
        console.error('RPC call failed:', rpcError)
        // If RPC fails, redirect to dashboard for safety
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }

    // Protect /dashboard
    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Redirect logged-in users away from /auth/*
    if (user && request.nextUrl.pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // Log error for debugging but continue request
    console.error('Middleware error:', error)
  }

  return response
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

