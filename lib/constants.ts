// API Routes
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
    RESET_PASSWORD: "/api/auth/reset-password",
    CALLBACK: "/api/auth/callback",
  },

  // Audio Processing
  AUDIO: {
    UPLOAD: "/api/audio/upload",
    TTS: "/api/audio/tts",
    STT: "/api/audio/stt",
    NOISE_REDUCE: "/api/audio/noise-reduce",
    DOWNLOAD: "/api/audio/download",
  },

  // Billing
  BILLING: {
    CREATE_CHECKOUT: "/api/billing/create-checkout",
    MANAGE_SUBSCRIPTION: "/api/billing/manage-subscription",
    WEBHOOK: "/api/billing/stripe-webhook",
    USAGE: "/api/billing/usage",
  },

  // Admin
  ADMIN: {
    USERS: "/api/admin/users",
    SUBSCRIPTIONS: "/api/admin/subscriptions",
    USAGE: "/api/admin/usage",
    DISCOUNT_CODES: "/api/admin/discount-codes",
  },
} as const

// File Upload Constants
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/flac", "audio/x-m4a"],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for resumable uploads
} as const

// Processing Status Constants
export const PROCESSING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

// Subscription Status Constants
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  PAST_DUE: "past_due",
  TRIALING: "trialing",
  UNPAID: "unpaid",
} as const

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in to access this resource",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "The requested resource was not found",
  INVALID_FILE_TYPE: "Invalid file type. Please upload an audio file",
  FILE_TOO_LARGE: "File is too large. Maximum size is 100MB",
  QUOTA_EXCEEDED: "You have exceeded your monthly usage quota",
  PROCESSING_FAILED: "Audio processing failed. Please try again",
  INVALID_SUBSCRIPTION: "Invalid or expired subscription",
  PAYMENT_REQUIRED: "Payment required to access this feature",
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  UPLOAD_COMPLETE: "File uploaded successfully",
  PROCESSING_COMPLETE: "Audio processing completed",
  SUBSCRIPTION_CREATED: "Subscription created successfully",
  SUBSCRIPTION_UPDATED: "Subscription updated successfully",
  ACCOUNT_CREATED: "Account created successfully",
  PASSWORD_RESET: "Password reset email sent",
} as const

// Feature Flags
export const FEATURES = {
  VOICE_CLONING: false,
  BATCH_PROCESSING: true,
  API_ACCESS: true,
  WHITE_LABEL: false,
  CUSTOM_MODELS: false,
} as const
