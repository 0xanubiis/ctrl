#!/usr/bin/env node

/**
 * Stripe Webhook Setup Script
 * 
 * This script helps you set up your Stripe webhook and get the webhook secret
 * Run with: node scripts/setup-stripe-webhook.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const WEBHOOK_ENDPOINT = '/api/stripe/webhooks';

console.log('🚀 Stripe Webhook Setup Helper');
console.log('===============================\n');

console.log('📍 Your webhook endpoint will be:');
console.log(`   ${BASE_URL}${WEBHOOK_ENDPOINT}\n`);

console.log('🔧 Setup Instructions:\n');

console.log('1. 📱 Install Stripe CLI:');
console.log('   macOS: brew install stripe/stripe-cli/stripe');
console.log('   Windows/Linux: Download from https://github.com/stripe/stripe-cli/releases\n');

console.log('2. 🔐 Login to Stripe:');
console.log('   stripe login\n');

console.log('3. 🌐 Start listening for webhooks:');
console.log(`   stripe listen --forward-to ${BASE_URL}${WEBHOOK_ENDPOINT}\n`);

console.log('4. 📋 Copy the webhook signing secret (starts with whsec_)\n');

console.log('5. 📝 Add it to your .env.local file:');
console.log('   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here\n');

console.log('6. ✅ Test the webhook:');
console.log('   stripe trigger customer.subscription.created\n');

console.log('📊 Alternative: Stripe Dashboard Setup');
console.log('=====================================\n');

console.log('1. Go to: https://dashboard.stripe.com/webhooks');
console.log('2. Click "Add endpoint"');
console.log('3. Set endpoint URL to your production domain + /api/stripe/webhooks');
console.log('4. Select these events:');
console.log('   - customer.subscription.created');
console.log('   - customer.subscription.updated');
console.log('   - customer.subscription.deleted');
console.log('   - invoice.payment_succeeded');
console.log('   - invoice.payment_failed');
console.log('   - customer.created');
console.log('   - checkout.session.completed');
console.log('5. Copy the signing secret\n');

console.log('🔍 Testing Your Webhook');
console.log('========================\n');

console.log('To test if your webhook is working:');
console.log('1. Make sure your app is running: npm run dev');
console.log('2. In another terminal, run: stripe listen --forward-to localhost:3000/api/stripe/webhooks');
console.log('3. Copy the webhook secret that appears');
console.log('4. Add it to your .env.local file');
console.log('5. Test with: stripe trigger customer.subscription.created');
console.log('6. Check your app logs for webhook events\n');

console.log('🚨 Important Security Notes:');
console.log('- Never commit your .env.local file to git');
console.log('- Keep your webhook secret secure');
console.log('- Use different secrets for development and production');
console.log('- Monitor webhook events in Stripe dashboard\n');

console.log('📚 Next Steps:');
console.log('1. Set up your database: npm run setup:database');
console.log('2. Test your setup: npm run test:dashboard');
console.log('3. Start using your application!\n');

console.log('🎉 Happy coding!');
