import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // Check if Supabase environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    // Return a mock client that will fail gracefully
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
            }),
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
          }),
        }),
      }),
      rpc: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    } as any
  }

  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value,
        set: (key: string, value: string, options: any) => {
          try {
            cookieStore.set({ name: key, value, ...options })
          } catch {
            // Ignore errors in server components
          }
        },
        remove: (key: string, options: any) => {
          try {
            cookieStore.set({ name: key, value: "", ...options })
          } catch {
            // Ignore errors in server components
          }
        },
      },
    }
  )
}

