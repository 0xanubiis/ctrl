"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink } from "lucide-react"

interface BillingPortalButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export default function BillingPortalButton({ variant = "default" }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePortal = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const { url, error } = await response.json()

      if (error) {
        console.error("Portal error:", error)
        return
      }

      window.open(url, "_blank")
    } catch (error) {
      console.error("Portal error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePortal} disabled={loading} variant={variant}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Manage Billing
        </>
      )}
    </Button>
  )
}
