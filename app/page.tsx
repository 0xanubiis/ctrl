import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { Volume2, Mic, Users, Zap, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

const features = [
  {
    name: "Text to Speech",
    description: "Convert any text into natural-sounding speech with AI voices",
    icon: Volume2,
    color: "text-primary",
  },
  {
    name: "Speech to Text",
    description: "Transcribe audio files with high accuracy and speed",
    icon: Mic,
    color: "text-secondary",
  },
  {
    name: "Voice Cloning",
    description: "Create custom AI voices from voice samples",
    icon: Users,
    color: "text-accent",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    content: "CTRL8 has revolutionized my content creation process. The voice quality is incredible!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Podcast Producer",
    content: "The transcription accuracy is amazing. It saves me hours of work every week.",
    rating: 5,
  },
  {
    name: "Emily Davis",
    role: "YouTuber",
    content: "Voice cloning feature is a game-changer. I can create content in multiple languages now.",
    rating: 5,
  },
]

const stats = [
  { name: "Audio Files Generated", value: "50K+" },
  { name: "Happy Customers", value: "2K+" },
  { name: "Languages Supported", value: "25+" },
  { name: "Uptime", value: "99.9%" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-4xl py-24 sm:py-32 lg:py-48">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 sm:mb-8 text-xs sm:text-sm">
              <Zap className="w-3 h-3 mr-1" />
              Powered by Advanced AI
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
              Transform Your Content with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">CTRL8</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground text-pretty px-4">
              Create natural-sounding speech, transcribe audio with precision, and clone voices using cutting-edge AI
              technology. Perfect for content creators, podcasters, and businesses.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 px-4">
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                <Link href="/auth/register">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 bg-transparent w-full sm:w-auto">
                <Link href="#demo">
                  <Play className="mr-2 w-4 h-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Trusted by creators worldwide
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-8 text-muted-foreground">
                Join thousands of content creators who use CTRL8 to enhance their work
              </p>
            </div>
            <dl className="mt-12 sm:mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col bg-card p-6 sm:p-8">
                  <dt className="text-xs sm:text-sm font-semibold leading-6 text-muted-foreground">{stat.name}</dt>
                  <dd className="order-first text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Everything you need for AI audio
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">
              Powerful AI tools to transform your audio content creation workflow
            </p>
          </div>
          <div className="mx-auto mt-12 sm:mt-16 lg:mt-24 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-12 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} aria-hidden="true" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{feature.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm sm:text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">What our customers say</h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">
              Don't just take our word for it - hear from content creators who love CTRL8
            </p>
          </div>
          <div className="mx-auto mt-12 sm:mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-card">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <blockquote className="text-sm sm:text-base text-foreground">"{testimonial.content}"</blockquote>
                  <div className="mt-6">
                    <div className="font-semibold text-sm sm:text-base text-foreground">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-card border-t border-border">
        <div className="px-4 sm:px-6 py-16 sm:py-24 lg:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Ready to transform your audio content?
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-8 text-muted-foreground">
              Join thousands of creators who are already using CTRL8 to enhance their content. Start your free trial
              today.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 bg-transparent w-full sm:w-auto">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
