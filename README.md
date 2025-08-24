# 🎵 AI Audio SaaS - Production Ready

A comprehensive AI-powered audio processing SaaS application with Text-to-Speech, Speech-to-Text, and Noise Reduction capabilities. Built with Next.js, Supabase, and Stripe.

## ✨ **Features**

- 🎤 **Text-to-Speech (TTS)** - 100+ AI voices with multiple languages
- 🎧 **Speech-to-Text (STT)** - High-accuracy transcription with OpenAI Whisper
- 🔇 **Noise Reduction** - AI-powered audio enhancement and cleanup
- 💳 **Subscription Management** - Stripe-powered billing with multiple tiers
- 🔐 **User Authentication** - Secure signup/login with OTP verification
- 📊 **Usage Tracking** - Monitor and enforce feature limits
- 🎨 **Modern UI** - Beautiful, responsive interface with shadcn/ui
- 🚀 **Production Ready** - Optimized for deployment and scaling

## 🚀 **Quick Start**

### **1. Clone and Install**

```bash
git clone <your-repo-url>
cd ai-audio-saas
npm install
```

### **2. Environment Setup**

Create `.env.local` with your API keys (see `SETUP_ENV.md` for details):

```bash
# Copy from SETUP_ENV.md and add your keys
cp SETUP_ENV.md .env.local
# Edit .env.local with your actual API keys
```

### **3. Database Setup**

Run the database setup scripts in Supabase:

```bash
# Copy the content of scripts/setup-database.sql
# Paste in your Supabase SQL Editor and run
```

### **4. Development**

```bash
npm run dev
# Open http://localhost:3000
```

### **5. Production Deployment**

```bash
npm run deploy:production
# Follow the interactive guide
```

## 🏗️ **Architecture**

```
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── audio/         # Audio processing APIs
│   │   └── stripe/        # Stripe integration
│   ├── auth/              # Auth pages (login, signup, OTP)
│   ├── dashboard/         # Main dashboard and features
│   ├── billing/           # Subscription management
│   └── pricing/           # Pricing page
├── components/             # Reusable UI components
│   ├── auth/              # Authentication forms
│   ├── dashboard/         # Feature interfaces
│   ├── billing/           # Billing components
│   └── ui/                # Base UI components
├── lib/                    # Utility libraries
│   ├── supabase/          # Database client
│   ├── stripe/            # Stripe configuration
│   └── audio/             # Audio processing clients
├── scripts/                # Setup and deployment scripts
└── hooks/                  # Custom React hooks
```

## 🔧 **Technology Stack**

- **Frontend**: Next.js 13+, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OTP verification
- **Payments**: Stripe subscriptions and billing
- **Audio Processing**: ElevenLabs TTS, OpenAI Whisper STT
- **Storage**: Vercel Blob for audio files
- **Deployment**: Vercel, Netlify, or self-hosted

## 📱 **Core Features**

### **Text-to-Speech (TTS)**
- 100+ AI voices across multiple languages
- Quality options (Standard, High, Ultra)
- Voice customization (stability, similarity boost)
- Batch processing support

### **Speech-to-Text (STT)**
- High-accuracy transcription (99%+)
- Multiple language support
- Real-time processing
- Audio format flexibility

### **Noise Reduction**
- AI-powered noise suppression
- Adjustable intensity levels
- Voice preservation
- Batch processing capabilities

### **Subscription Management**
- Free, Pro ($15), Premium ($30) tiers
- Usage-based limits and tracking
- Stripe-powered billing
- Customer portal integration

## 🗄️ **Database Schema**

- **profiles**: User account information
- **subscriptions**: Subscription and billing data
- **usage_tracking**: Feature usage monitoring
- **audio_files**: Processed audio file metadata

## 🔐 **Security Features**

- Row Level Security (RLS) policies
- JWT-based authentication
- OTP verification for email confirmation
- Secure API key management
- CORS protection
- Rate limiting ready

## 🚀 **Deployment Options**

### **Vercel (Recommended)**
```bash
npm run deploy:production
# Choose option 1 for Vercel
```

### **Netlify**
```bash
npm run deploy:production
# Choose option 2 for Netlify
```

### **Self-Hosted**
```bash
npm run deploy:production
# Choose option 3 for self-hosted
```

## 📚 **Documentation**

- **`SETUP_ENV.md`** - Environment configuration guide
- **`PRODUCTION_DEPLOYMENT.md`** - Complete deployment guide
- **`CONFIGURATION.md`** - Service setup and configuration
- **`DASHBOARD_FEATURES.md`** - Feature documentation and usage
- **`scripts/README.md`** - Database setup instructions

## 🧪 **Testing**

```bash
# Test dashboard functionality
npm run test:dashboard

# Test Stripe setup
npm run setup:stripe

# Build test
npm run build

# Lint check
npm run lint
```

## 🔧 **Configuration**

### **Database Setup**

1. Run `scripts/setup-database.sql` in Supabase
2. Verify RLS policies are active
3. Test user creation and authentication

### **Stripe Setup**

1. Configure webhook endpoint
2. Set up subscription products
3. Test checkout flow

## 📊 **Usage Limits**

| Plan | TTS Voices | STT Minutes | Noise Reduction | Audio Recording | Export Tools |
|------|------------|-------------|-----------------|-----------------|--------------|
| Free | Basic only | 20/month | Limited (short clips) | ❌ | ❌ |
| Pro | Premium | 300/month (5 hours) | Unlimited | ✅ | ✅ |
| Premium | Premium | 1200/month (20 hours) | Unlimited | ✅ | ✅ |

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check TypeScript errors

2. **Environment Variables**
   - Ensure `.env.local` exists
   - Verify all required keys are set
   - Restart development server

3. **Database Connection**
   - Check Supabase credentials
   - Verify RLS policies
   - Check network connectivity

4. **Stripe Integration**
   - Verify webhook configuration
   - Check API key validity
   - Test with Stripe CLI

### **Getting Help**

1. Check the documentation files
2. Run test scripts to identify issues
3. Check browser console for errors
4. Verify environment variables

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 **Support**

For support and questions:
- Check the documentation files
- Run the test scripts
- Review the configuration guides

---

**Built with ❤️ using Next.js, Supabase, and Stripe**
