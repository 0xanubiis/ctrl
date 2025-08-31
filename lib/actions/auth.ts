"use server"

import { createServerActionClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/types/database"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
        data: {
          full_name: fullName?.toString() || "",
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Account created successfully! Please check your email for the verification code." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function resetPassword(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")

  if (!email) {
    return { error: "Email is required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toString(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Check your email for password reset instructions." }
  } catch (error) {
    console.error("Password reset error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function verifyOTP(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const otp = formData.get("otp")

  if (!otp || otp.toString().length !== 6) {
    return { error: "Please enter a valid 6-digit verification code" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore })

  try {
    // For Supabase, we need to verify the OTP using the verifyOtp method
    // This assumes the user has already received the OTP via email
    const { data, error } = await supabase.auth.verifyOtp({
      token: otp.toString(),
      type: 'email',
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user && data.session) {
      // Redirect to dashboard after successful verification
      redirect("/dashboard")
    }

    return { success: "Email verified successfully! Redirecting to dashboard..." }
  } catch (error) {
    console.error("OTP verification error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
