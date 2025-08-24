"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, FileAudio, AudioWaveformIcon as Waveform, TrendingUp, Clock, Zap, CreditCard, Sparkles, Rocket } from "lucide-react"
import Link from "next/link"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"
import SubscriptionManager from "./subscription-manager"

interface DashboardPageProps {
  user: any
  subscription: any
  usage: any
}

export default function DashboardPage({ user, subscription, usage }: DashboardPageProps) {
  const currentTier = subscription?.tier || "free"
  const currentPlan = SUBSCRIPTION_PLANS[currentTier]

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AAS</span>
              </Link>
              <div className="h-6 w-px bg-border/50"></div>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                {currentPlan.name}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/billing">
                <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 transition-colors">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 transition-colors">Upgrade</Button>
              </Link>
              <form action="/auth/logout" method="post">
                <Button variant="ghost" size="sm" type="submit" className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Welcome back, {user.full_name || user.email}</h1>
              <p className="text-muted-foreground text-lg">Create amazing audio content with AI-powered tools</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/dashboard/tts">
            <Card className="hover:shadow-xl transition-all duration-300 hover-lift cursor-pointer border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold">Text to Speech</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg ml-auto">
                  <Mic className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">Generate</div>
                <p className="text-sm text-muted-foreground">Convert text to natural speech</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/stt">
            <Card className="hover:shadow-xl transition-all duration-300 hover-lift cursor-pointer border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold">Speech to Text</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg ml-auto">
                  <FileAudio className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">Transcribe</div>
                <p className="text-sm text-muted-foreground">Convert speech to accurate text</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/noise-reduction">
            <Card className="hover:shadow-xl transition-all duration-300 hover-lift cursor-pointer border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold">Noise Reduction</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg ml-auto">
                  <Waveform className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">Clean</div>
                <p className="text-sm text-muted-foreground">Remove background noise</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Subscription Management */}
        <div className="mb-12">
          <SubscriptionManager user={user} subscription={subscription} usage={usage} />
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Your latest audio processing jobs and usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileAudio className="h-10 w-10 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
              <p className="text-sm mb-4">Start creating audio content to see your history here</p>
              <div className="flex justify-center space-x-4">
                <Link href="/dashboard/tts">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Mic className="mr-2 h-4 w-4" />
                    Try TTS
                  </Button>
                </Link>
                <Link href="/dashboard/stt">
                  <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10">
                    <FileAudio className="mr-2 h-4 w-4" />
                    Try STT
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
              <div className="text-sm text-muted-foreground">TTS Generations</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileAudio className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">0</div>
              <div className="text-sm text-muted-foreground">STT Minutes</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Waveform className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
              <div className="text-sm text-muted-foreground">Noise Reductions</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">0%</div>
              <div className="text-sm text-muted-foreground">Usage This Month</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
