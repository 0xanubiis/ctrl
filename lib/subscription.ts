import { createClient } from "@/lib/supabase/server"

export async function getUserTier(userId: string): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .single()

  if (error || !data) return "free"
  return data.tier || "free"
}
