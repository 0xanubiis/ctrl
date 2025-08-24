"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, Shield, Mail } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full text-sm py-2">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Verifying...
        </>
      ) : (
        "Verify Email"
      )}
    </Button>
  )
}

export default function VerifyOTPForm() {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      // Clear any existing timers
      setResendCooldown(0)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError("Email is required")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit verification code")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data.message)
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    if (resendCooldown > 0) {
      return
    }

    setIsResending(true)
    setResendMessage("")
    setError("")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResendMessage(data.message)
        // Set 60 second cooldown
        setResendCooldown(60)
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || "Failed to resend verification code")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Shield className="h-5 w-5 text-primary" />
          </div>
        </div>
        <CardTitle className="text-lg font-bold">Verify your email</CardTitle>
        <CardDescription className="text-xs">
          Enter the 6-digit code sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-3 py-2 rounded text-xs">
              {success}
            </div>
          )}

          {resendMessage && (
            <div className="bg-blue-500/10 border border-blue-500/50 text-blue-700 px-3 py-2 rounded text-xs">
              {resendMessage}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-medium">
              Email Address
            </label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="text-sm py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-center">
              Verification Code
            </label>
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-digit code from your email
            </p>
            <InputOTP
              value={otp}
              onChange={(value) => setOtp(value)}
              maxLength={6}
              containerClassName="justify-center"
            >
              <InputOTPGroup className="gap-1">
                <InputOTPSlot index={0} className="h-8 w-8 text-sm" />
                <InputOTPSlot index={1} className="h-8 w-8 text-sm" />
                <InputOTPSlot index={2} className="h-8 w-8 text-sm" />
                <InputOTPSlot index={3} className="h-8 w-8 text-sm" />
                <InputOTPSlot index={4} className="h-8 w-8 text-sm" />
                <InputOTPSlot index={5} className="h-8 w-8 text-sm" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <SubmitButton isLoading={isLoading} />

          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || resendCooldown > 0}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {isResending 
                  ? "Resending..." 
                  : resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : "Resend code"
                }
              </button>
            </p>
            <p>
              Already verified?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground/70">
              Check your spam folder if you don't see the email
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
