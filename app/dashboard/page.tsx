import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Volume2, Mic, Users, FileAudio, TrendingUp, Clock, Zap } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user subscription and usage data
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("user_id", user?.id)
    .eq("status", "active")
    .single()

  const { data: tokenUsage } = await supabase.from("token_usage").select("*").eq("user_id", user?.id)

  const { data: recentFiles } = await supabase
    .from("audio_files")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const totalTokensUsed = tokenUsage?.reduce((sum, usage) => sum + usage.tokens_used, 0) || 0
  const totalTokensAvailable = subscription?.subscription_plans?.tokens_per_month || 1000
  const usagePercentage = (totalTokensUsed / totalTokensAvailable) * 100

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">Ready to create amazing audio content with AI?</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {subscription?.subscription_plans?.name || "Free"} Plan
        </Badge>
      </div>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Token Usage This Month
          </CardTitle>
          <CardDescription>
            {totalTokensUsed.toLocaleString()} of {totalTokensAvailable.toLocaleString()} tokens used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={usagePercentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(usagePercentage)}% used • {(totalTokensAvailable - totalTokensUsed).toLocaleString()} tokens
            remaining
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Volume2 className="w-8 h-8 text-primary" />
              <Button asChild size="sm">
                <Link href="/dashboard/text-to-speech">Start</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Text to Speech</CardTitle>
            <CardDescription>Convert text into natural-sounding speech</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Mic className="w-8 h-8 text-primary" />
              <Button asChild size="sm">
                <Link href="/dashboard/speech-to-text">Start</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Speech to Text</CardTitle>
            <CardDescription>Transcribe audio files to accurate text</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-primary" />
              <Button asChild size="sm">
                <Link href="/dashboard/voice-cloning">Start</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Voice Cloning</CardTitle>
            <CardDescription>Create custom AI voices from samples</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <FileAudio className="w-8 h-8 text-primary" />
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/files">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Audio Files</CardTitle>
            <CardDescription>Manage your generated audio content</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentFiles && recentFiles.length > 0 ? (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileAudio className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      Play
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No files yet. Create your first audio file!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenUsage?.map((usage) => (
                <div key={usage.usage_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {usage.usage_type === "tts" && <Volume2 className="w-4 h-4" />}
                    {usage.usage_type === "stt" && <Mic className="w-4 h-4" />}
                    {usage.usage_type === "voice_clone" && <Users className="w-4 h-4" />}
                    <span className="capitalize">{usage.usage_type.replace("_", " ")}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{usage.tokens_used.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">tokens used</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
