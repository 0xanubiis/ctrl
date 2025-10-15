import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Mic, AudioWaveform as Waveform, Sparkles, Users, Shield, Clock, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingFooter } from "@/components/marketing/marketing-footer"

const features = [
  {
    icon: Mic,
    title: "AI Voice Enhancement",
    description:
      "Transform your voice recordings with advanced AI algorithms that reduce noise, enhance clarity, and optimize audio quality.",
  },
  {
    icon: Waveform,
    title: "Audio Processing",
    description:
      "Professional-grade audio processing tools including EQ, compression, and mastering effects powered by machine learning.",
  },
  {
    icon: Sparkles,
    title: "Smart Transcription",
    description:
      "Accurate speech-to-text conversion with speaker identification, timestamps, and automatic punctuation.",
  },
  {
    icon: Users,
    title: "Collaboration Tools",
    description: "Share projects with team members, leave comments, and collaborate in real-time on audio content.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and security measures to protect your sensitive audio content and data.",
  },
  {
    icon: Clock,
    title: "Fast Processing",
    description: "Lightning-fast audio processing with cloud-based infrastructure that scales with your needs.",
  },
]

async function PricingPlansData() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .neq("id", "free")
    .order("price_monthly", { ascending: true })

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Pricing plans are being updated. Please check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Free Plan */}
      <Card className="border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Free</CardTitle>
          <div className="mt-4">
            <span className="text-4xl font-bold text-foreground">$0</span>
            <span className="text-muted-foreground ml-2">/month</span>
          </div>
          <CardDescription className="mt-2">Perfect for getting started with AI audio processing</CardDescription>
          <p className="text-sm text-muted-foreground mt-2">1,000 tokens per month</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            {[
              "1,000 processing tokens/month",
              "Basic audio enhancement",
              "Standard transcription",
              "Community support"
            ].map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="w-full" variant="outline">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Paid Plans */}
      {plans.map((plan, index) => (
        <Card key={plan.id} className={`relative border-border ${plan.id === "pro" ? "ring-2 ring-primary" : ""}`}>
          {plan.id === "pro" && (
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          )}
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-foreground">${(plan.price_monthly / 100).toFixed(0)}</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <CardDescription className="mt-2">{plan.description}</CardDescription>
            <p className="text-sm text-muted-foreground mt-2">{plan.tokens_per_month.toLocaleString()} tokens per month</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature: string, featureIndex: number) => (
                <li key={featureIndex} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full" variant={plan.id === "pro" ? "default" : "outline"}>
              <Link href="/pricing">View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      
      <div className="px-6 py-4 border-b border-border">
        <Button asChild variant="ghost" size="sm">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">CTRL8</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your audio content with cutting-edge artificial intelligence. From voice enhancement to smart
            transcription, we provide professional-grade audio processing tools that help creators, businesses, and
            teams produce exceptional audio content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Powerful Features for Every Creator</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform offers everything you need to create, enhance, and manage professional audio
              content.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core AI features with different usage limits
              and advanced capabilities.
            </p>
          </div>
          <Suspense fallback={
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border animate-pulse">
                  <CardHeader className="text-center">
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-12 bg-muted rounded mb-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-4 bg-muted rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <PricingPlansData />
          </Suspense>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Transform Your Audio Content?</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Join thousands of creators who are already using CTRL8 to enhance their content. Start your free trial today
            and experience the power of AI-driven audio processing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View All Plans</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <MarketingFooter />
    </div>
  )
}
