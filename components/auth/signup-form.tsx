"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mic } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mic className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>Get started with AAS today</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded text-sm">
              <div className="space-y-3">
                <p className="font-medium">{state.success}</p>
                <div className="text-xs text-green-600">
                  <p>• Check your email for a verification code</p>
                  <p>• Enter the code below to complete your registration</p>
                </div>
                <Link 
                  href="/auth/verify-otp" 
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors font-medium"
                >
                  Verify Email Now
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium">
              Full Name
            </label>
            <Input id="fullName" name="fullName" type="text" placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input id="password" name="password" type="password" placeholder="At least 8 characters" required />
          </div>

          <SubmitButton />

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
