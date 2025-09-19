"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      // Handles the OAuth redirect & sets the session
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)

      if (error) {
        console.error("Auth callback error:", error.message)
        router.replace("/auth/login?error=callback_failed")
        return
      }

      if (data?.session) {
        // Redirect user after successful login
        router.replace("/dashboard")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-medium">Signing you in...</p>
    </div>
  )
}
