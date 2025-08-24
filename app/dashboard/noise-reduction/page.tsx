import { getCurrentUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NoiseReductionInterface from "@/components/dashboard/noise-reduction-interface"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"

export default async function NoiseReductionPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Mic className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">AAS</span>
              </Link>
              <span className="text-muted-foreground">/ Noise Reduction</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/dashboard/tts">
                <Button variant="ghost">Text to Speech</Button>
              </Link>
              <Link href="/dashboard/stt">
                <Button variant="ghost">Speech to Text</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Noise Reduction</h1>
          <p className="text-muted-foreground">Remove background noise and enhance audio quality</p>
        </div>

        <NoiseReductionInterface />
      </div>
    </div>
  )
}
