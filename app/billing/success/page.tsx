import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Subscription Activated!</CardTitle>
          <CardDescription>
            Thank you for subscribing to AAS. Your account has been upgraded successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You now have access to all the features included in your plan. Start creating amazing audio content!
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline" className="w-full bg-transparent">
                View Billing Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
