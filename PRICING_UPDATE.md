# Pricing Update Instructions

## New Pricing Structure

- **Free Plan**: $0/month - 25 tokens
- **Starter Plan**: $5/month - 100 tokens  
- **Pro Plan**: $15/month - 250 tokens
- **Premium Plan**: $30/month - 500 tokens

## Changes Made

### 1. Fixed Import Issue
- ✅ Fixed `CheckCircle` import in `components/pricing/pricing-content.tsx`

### 2. Database Update Script
- ✅ Created `scripts/009_update_pricing.sql` with new pricing

### 3. Yearly Pricing (20% Discount)
- **Starter**: $50/year (save $10)
- **Pro**: $150/year (save $30)  
- **Premium**: $300/year (save $60)

## To Apply Changes

### Option 1: Run SQL Script (Recommended)
Execute the SQL script in your Supabase dashboard:

```sql
-- Update subscription plans with correct pricing
-- Starter: $5/month, Pro: $15/month, Premium: $30/month

-- Update Starter plan (previously 'pro' with different pricing)
UPDATE subscription_plans 
SET 
  name = 'Starter',
  description = 'Perfect for getting started with AI audio',
  price_monthly = 500, -- $5.00
  price_yearly = 5000, -- $50.00 (save $10/year)
  tokens_per_month = 100,
  features = '["100 tokens per month", "Basic AI voices", "Standard quality", "Email support", "5 voice clones"]'::jsonb,
  stripe_price_id_monthly = 'price_starter_monthly',
  stripe_price_id_yearly = 'price_starter_yearly'
WHERE id = 'pro';

-- Update Pro plan (previously 'enterprise')
UPDATE subscription_plans 
SET 
  name = 'Pro',
  description = 'Best for professionals and content creators',
  price_monthly = 1500, -- $15.00
  price_yearly = 15000, -- $150.00 (save $30/year)
  tokens_per_month = 250,
  features = '["250 tokens per month", "Premium AI voices", "High quality audio", "Priority support", "Unlimited voice clones", "API access"]'::jsonb,
  stripe_price_id_monthly = 'price_pro_monthly',
  stripe_price_id_yearly = 'price_pro_yearly'
WHERE id = 'enterprise';

-- Update Premium plan
UPDATE subscription_plans 
SET 
  name = 'Premium',
  description = 'For power users and businesses',
  price_monthly = 3000, -- $30.00
  price_yearly = 30000, -- $300.00 (save $60/year)
  tokens_per_month = 500,
  features = '["500 tokens per month", "All premium features", "Ultra-high quality", "24/7 support", "White-label options", "Custom integrations", "Advanced analytics"]'::jsonb,
  stripe_price_id_monthly = 'price_premium_monthly',
  stripe_price_id_yearly = 'price_premium_yearly'
WHERE id = 'premium';
```

### Option 2: Update Stripe Price IDs
After updating the database, you'll need to:

1. **Create new Stripe Price IDs** for the new pricing:
   - `price_starter_monthly` - $5.00/month
   - `price_starter_yearly` - $50.00/year
   - `price_pro_monthly` - $15.00/month  
   - `price_pro_yearly` - $150.00/year
   - `price_premium_monthly` - $30.00/month
   - `price_premium_yearly` - $300.00/year

2. **Update the database** with the actual Stripe price IDs from your Stripe dashboard

## Verification

After applying changes:
- ✅ Pricing page should show new prices
- ✅ Payment flow should work with new pricing
- ✅ Webhook should handle plan changes correctly
- ✅ Token allocation should match new limits

## Current Status

- ✅ **Pricing Page**: Fixed import issue, accessible
- ✅ **Payment Flow**: Working with current pricing
- ✅ **Webhook**: Enhanced to handle plan changes
- ✅ **Database Script**: Ready to apply new pricing
- ⏳ **Stripe Integration**: Needs price ID updates after database changes
