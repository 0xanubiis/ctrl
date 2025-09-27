import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Check if Supabase environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    // Return a mock client that will fail gracefully
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signIn: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
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

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

