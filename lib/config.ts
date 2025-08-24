// Application Configuration
export const config = {
  app: {
    name: "AI Audio SaaS",
    description: "Professional-grade AI audio processing",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Audio Processing Limits
  audio: {
    maxFileSizeMB: 100,
    supportedFormats: ["mp3", "wav", "ogg", "m4a", "flac"],
    maxDurationMinutes: 60,
    sampleRates: [16000, 22050, 44100, 48000],
    defaultSampleRate: 48000,
  },

  // Subscription Plans
  plans: {
    free: {
      id: "free",
      name: "Free",
      price: 0,
      currency: "usd",
      interval: "month" as const,
      features: ["10 minutes per month", "Basic TTS & STT", "Standard quality", "Email support"],
      limits: {
        monthly_minutes: 10,
        max_file_size_mb: 10,
        concurrent_jobs: 1,
      },
    },
    pro: {
      id: "pro",
      name: "Pro",
      price: 2900, // $29.00 in cents
      currency: "usd",
      interval: "month" as const,
      features: [
        "300 minutes per month",
        "All AI features",
        "High quality processing",
        "Priority support",
        "API access",
      ],
      limits: {
        monthly_minutes: 300,
        max_file_size_mb: 50,
        concurrent_jobs: 3,
      },
      is_popular: true,
    },
    premium: {
      id: "premium",
      name: "Premium",
      price: 9900, // $99.00 in cents
      currency: "usd",
      interval: "month" as const,
      features: [
        "Unlimited usage",
        "Custom voice training",
        "White-label options",
        "Dedicated support",
        "Advanced API features",
        "Custom integrations",
      ],
      limits: {
        monthly_minutes: -1, // Unlimited
        max_file_size_mb: 100,
        concurrent_jobs: 10,
      },
    },
  },

  // AI Provider Configuration
  providers: {
    tts: {
      primary: "elevenlabs",
      fallback: "openai",
      voices: {
        elevenlabs: [
          { id: "rachel", name: "Rachel", gender: "female" },
          { id: "drew", name: "Drew", gender: "male" },
          { id: "clyde", name: "Clyde", gender: "male" },
          { id: "paul", name: "Paul", gender: "male" },
        ],
        openai: [
          { id: "alloy", name: "Alloy", gender: "neutral" },
          { id: "echo", name: "Echo", gender: "male" },
          { id: "fable", name: "Fable", gender: "neutral" },
          { id: "onyx", name: "Onyx", gender: "male" },
          { id: "nova", name: "Nova", gender: "female" },
          { id: "shimmer", name: "Shimmer", gender: "female" },
        ],
      },
    },
    stt: {
      primary: "openai",
      models: ["whisper-1"],
      languages: ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"],
    },
    noise_reduction: {
      primary: "local", // ffmpeg + rnnoise
      fallback: "cloud", // External API
    },
  },

  // Rate Limiting
  rateLimit: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
    },
    upload: {
      windowMs: 60 * 1000, // 1 minute
      max: 10, // uploads per minute
    },
  },

  // Storage Configuration
  storage: {
    bucket: "audio-files",
    maxRetentionDays: 30,
    signedUrlExpiryHours: 24,
  },
} as const

// Environment validation
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "OPENAI_API_KEY",
    "NEXT_PUBLIC_APP_URL",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

// Helper to check if optional providers are configured
export function getAvailableProviders() {
  return {
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    noise_api: !!process.env.NOISE_API_KEY,
  }
}
