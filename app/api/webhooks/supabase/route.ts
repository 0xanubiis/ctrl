import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("x-supabase-signature")

    // Verify webhook signature (implement your verification logic)
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle different Supabase events
    switch (event.type) {
      case "INSERT":
        if (event.table === "profiles") {
          // Handle new user registration
          console.log("New user registered:", event.record.id)
          // You could send welcome emails, initialize user data, etc.
        }
        break

      case "UPDATE":
        if (event.table === "subscriptions") {
          // Handle subscription updates
          console.log("Subscription updated:", event.record.id)
          // You could send notifications, update user permissions, etc.
        }
        break

      case "DELETE":
        // Handle deletions
        console.log("Record deleted from", event.table)
        break

      default:
        console.log("Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Supabase webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
