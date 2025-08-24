export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "user" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: "active" | "canceled" | "past_due" | "incomplete" | "trialing"
          tier: "free" | "starter" | "pro" | "enterprise"
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: "active" | "canceled" | "past_due" | "incomplete" | "trialing"
          tier?: "free" | "starter" | "pro" | "enterprise"
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: "active" | "canceled" | "past_due" | "incomplete" | "trialing"
          tier?: "free" | "starter" | "pro" | "enterprise"
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          feature_type: string
          usage_count: number
          month_year: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature_type: string
          usage_count?: number
          month_year: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature_type?: string
          usage_count?: number
          month_year?: string
          created_at?: string
          updated_at?: string
        }
      }
      audio_files: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_filename: string
          file_size: number
          duration_seconds: number | null
          file_type: string
          status: string
          storage_path: string
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          original_filename: string
          file_size: number
          duration_seconds?: number | null
          file_type: string
          status?: string
          storage_path: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          original_filename?: string
          file_size?: number
          duration_seconds?: number | null
          file_type?: string
          status?: string
          storage_path?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
