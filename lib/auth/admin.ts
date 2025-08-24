import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return { user, profile }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return profile?.role === "admin"
}
