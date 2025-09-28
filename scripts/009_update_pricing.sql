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
