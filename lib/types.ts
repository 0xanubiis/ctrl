// User and Authentication Types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
}

// Subscription and Billing Types
export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid"
  plan_id: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  limits: {
    monthly_minutes: number
    max_file_size_mb: number
    concurrent_jobs: number
  }
  stripe_price_id: string
  is_popular?: boolean
}

// Audio Processing Types
export interface AudioFile {
  id: string
  user_id: string
  filename: string
  original_filename: string
  file_size: number
  duration?: number
  mime_type: string
  storage_path: string
  status: "uploading" | "processing" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export interface ProcessingJob {
  id: string
  user_id: string
  audio_file_id: string
  job_type: "tts" | "stt" | "noise_reduction"
  status: "pending" | "processing" | "completed" | "failed"
  input_data: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  processing_time_ms?: number
  created_at: string
  updated_at: string
  completed_at?: string
}

// TTS Types
export interface TTSRequest {
  text: string
  voice?: string
  speed?: number
  pitch?: number
  output_format?: "mp3" | "wav" | "ogg"
}

export interface TTSResponse {
  audio_url: string
  duration: number
  file_size: number
  voice_used: string
}

// STT Types
export interface STTRequest {
  audio_file_id: string
  language?: string
  model?: string
}

export interface STTResponse {
  transcript: string
  confidence: number
  language_detected?: string
  segments?: Array<{
    start: number
    end: number
    text: string
    confidence: number
  }>
}

// Noise Reduction Types
export interface NoiseReductionRequest {
  audio_file_id: string
  strength?: number
  preserve_speech?: boolean
}

export interface NoiseReductionResponse {
  processed_audio_url: string
  original_file_size: number
  processed_file_size: number
  noise_reduction_db: number
}

// Usage Tracking Types
export interface UsageRecord {
  id: string
  user_id: string
  subscription_id?: string
  job_type: "tts" | "stt" | "noise_reduction"
  minutes_used: number
  cost_cents: number
  created_at: string
}

export interface UsageSummary {
  current_period_minutes: number
  total_minutes_used: number
  remaining_minutes: number
  jobs_completed: number
  cost_this_period_cents: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Component Props Types
export interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onError: (error: string) => void
  maxDuration?: number
  sampleRate?: number
}

export interface AudioPlayerProps {
  src: string
  title?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

// Environment Variables Type
export interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  OPENAI_API_KEY: string
  ELEVENLABS_API_KEY?: string
  NOISE_API_KEY?: string
  NEXT_PUBLIC_APP_URL: string
}
