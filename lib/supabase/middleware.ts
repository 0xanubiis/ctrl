import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if required environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return request.cookies.get(key)?.value || null
        },
        setItem: (key: string, value: string) => {
          request.cookies.set(key, value)
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set(key, value, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
          })
        },
        removeItem: (key: string) => {
          request.cookies.delete(key)
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.delete(key)
        },
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }

      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc("is_admin", {
        user_uuid: user.id,
      })

      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }

    // Redirect authenticated users away from auth pages
    if (user && request.nextUrl.pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // Continue with the request even if there's an error
  }

  return supabaseResponse
}
