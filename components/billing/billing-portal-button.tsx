"use client"

import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { useState } from "react"

export function BillingPortalButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenPortal = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error opening billing portal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleOpenPortal} disabled={isLoading} variant="outline">
      <CreditCard className="h-4 w-4 mr-2" />
      {isLoading ? "Loading..." : "Manage Billing"}
    </Button>
  )
}
