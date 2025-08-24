import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Zap, Star, Crown, Check, ArrowRight, Play, FileAudio, Volume2, Headphones, Sparkles, Rocket, Shield, Zap as Lightning } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AAS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="ghost" className="hover:bg-primary/10 transition-colors">Pricing</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10 transition-colors">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
            <Sparkles className="w-4 h-4 mr-2" />
            🚀 AI-Powered Audio Processing
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            Transform Your Audio with
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Magic
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Professional-grade Text-to-Speech, Speech-to-Text, and Noise Reduction powered by cutting-edge AI technology.
            Perfect for content creators, developers, and businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift">
                Start Free Trial
                <Rocket className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 border-primary/20 hover:bg-primary/10 transition-all duration-300">
                View Pricing
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-muted-foreground">AI Voices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99%+</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">Powerful AI Audio Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, process, and enhance audio content with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="text-center border-0 shadow-xl hover-lift bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardHeader>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Volume2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-3">Text-to-Speech</CardTitle>
                <CardDescription className="text-base">
                  Convert text to natural-sounding speech with multiple voices and languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-3 text-left">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span>100+ AI voices</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span>Multiple languages</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span>High-quality audio</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl hover-lift bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardHeader>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Mic className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-3">Speech-to-Text</CardTitle>
                <CardDescription className="text-base">
                  Transcribe audio to text with high accuracy and multiple language support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-3 text-left">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    <span>99%+ accuracy</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    <span>Real-time processing</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    <span>Multiple formats</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl hover-lift bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Headphones className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-3">Noise Reduction</CardTitle>
                <CardDescription className="text-base">
                  Remove background noise and enhance audio quality with AI-powered filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-3 text-left">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span>Advanced algorithms</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span>Preserve voice quality</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span>Batch processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-0 shadow-xl hover-lift bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-5xl font-bold mb-2">$0</div>
                <CardDescription className="text-base">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>100 TTS characters/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>20 minutes STT/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Basic noise reduction</span>
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full border-2 border-primary/20 hover:bg-primary/10 transition-colors">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-2xl hover-lift bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-5xl font-bold mb-2">$15</div>
                <CardDescription className="text-base">For content creators</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>10,000 TTS characters/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>5 hours STT/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited noise reduction</span>
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300">Choose Pro</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl hover-lift bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-5xl font-bold mb-2">$30</div>
                <CardDescription className="text-base">For professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>100,000 TTS characters/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>20 hours STT/month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority API access</span>
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full border-2 border-primary/20 hover:bg-primary/10 transition-colors">Choose Premium</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-16">
            <Link href="/pricing">
              <Button variant="ghost" size="lg" className="text-lg px-8 py-4 hover:bg-primary/10 transition-colors">
                View All Plans
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl">
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Audio?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of creators and professionals who trust our AI-powered audio tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift">
                  Start Free Trial
                  <Rocket className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300">
                  View Pricing
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 px-4 relative">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AAS</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered audio processing for creators, developers, and businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/auth/signup" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 AAS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
