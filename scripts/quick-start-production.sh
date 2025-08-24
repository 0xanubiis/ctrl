#!/bin/bash

# 🚀 AI Audio SaaS - Production Quick Start Script
# This script helps you quickly deploy your application to production

set -e

echo "🚀 AI Audio SaaS - Production Quick Start"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Production ready'"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Production Deployment Checklist"
echo "=================================="
echo ""

# Check environment file
if [ ! -f ".env.local" ]; then
    echo "❌ Missing .env.local file"
    echo "   Please create it with your production API keys"
    echo "   See SETUP_ENV.md for details"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ .env.local file found"
fi

# Check if database is set up
echo ""
echo "🗄️  Database Setup"
echo "=================="
echo "Have you set up your Supabase database?"
echo "Run the SQL scripts in scripts/ folder if not:"
echo "   - scripts/setup-database.sql (complete setup)"
echo "   - scripts/setup-database-simple.sql (step by step)"
echo ""

# Check Stripe webhook
echo "💳 Stripe Configuration"
echo "======================="
echo "Have you configured your Stripe webhook for production?"
echo "Endpoint: https://yourdomain.com/api/stripe/webhooks"
echo "Events: customer.subscription.*, invoice.payment.*, etc."
echo ""

# Build check
echo "🔨 Build Test"
echo "============="
echo "Testing build process..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying"
    exit 1
fi

echo ""
echo "🚀 Deployment Options"
echo "===================="
echo "1. Vercel (Recommended for Next.js)"
echo "2. Netlify"
echo "3. Self-hosted (VPS/Server)"
echo ""

read -p "Choose deployment option (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        echo ""
        echo "🌐 Vercel Deployment"
        echo "===================="
        echo "1. Go to https://vercel.com/dashboard"
        echo "2. Click 'New Project'"
        echo "3. Import your GitHub repository"
        echo "4. Set environment variables (see PRODUCTION_DEPLOYMENT.md)"
        echo "5. Deploy!"
        echo ""
        echo "Your app will be available at: https://your-project.vercel.app"
        ;;
    2)
        echo ""
        echo "🌐 Netlify Deployment"
        echo "====================="
        echo "1. Go to https://netlify.com"
        echo "2. Click 'New site from Git'"
        echo "3. Connect your GitHub repository"
        echo "4. Set build command: npm run build"
        echo "5. Set publish directory: .next"
        echo "6. Set environment variables"
        echo "7. Deploy!"
        ;;
    3)
        echo ""
        echo "🖥️  Self-Hosted Deployment"
        echo "=========================="
        echo "1. Provision a VPS (DigitalOcean, AWS, etc.)"
        echo "2. Install Node.js 18+ and npm"
        echo "3. Clone your repository"
        echo "4. Install dependencies: npm install --production"
        echo "5. Build: npm run build"
        echo "6. Start: npm start"
        echo "7. Set up Nginx reverse proxy and SSL"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "📚 Next Steps"
echo "============="
echo "1. Set up your production domain"
echo "2. Configure SSL certificate"
echo "3. Set up monitoring and analytics"
echo "4. Test all features thoroughly"
echo "5. Monitor performance and errors"
echo ""

echo "📖 Documentation"
echo "==============="
echo "- SETUP_ENV.md - Environment setup"
echo "- PRODUCTION_DEPLOYMENT.md - Detailed deployment guide"
echo "- CONFIGURATION.md - Service configuration"
echo "- DASHBOARD_FEATURES.md - Feature documentation"
echo ""

echo "🎉 Good luck with your deployment!"
echo "For help, check the documentation files or run:"
echo "   npm run test:dashboard"
echo "   npm run setup:stripe"
