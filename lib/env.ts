/**
 * Environment variable validation utility
 */

export function validateSupabaseEnv() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file and ensure all Supabase variables are set.'
    );
  }

  return requiredEnvVars;
}

export function getSupabaseEnv() {
  try {
    return validateSupabaseEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw error;
  }
}
