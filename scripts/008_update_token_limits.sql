-- Update subscription plans to match the provided token limits
-- TOKENS_FREE=25, TOKENS_STARTER=100, TOKENS_PRO=250, TOKENS_PREMIUM=500

UPDATE subscription_plans 
SET tokens_per_month = 25
WHERE id = 'free';

UPDATE subscription_plans 
SET 
  name = 'Starter',
  tokens_per_month = 100,
  price_monthly = 999, -- $9.99
  price_yearly = 9990, -- $99.90
  features = '["100 tokens per month", "Basic AI voices", "Standard quality", "Email support", "5 voice clones"]'::jsonb
WHERE id = 'pro';

UPDATE subscription_plans 
SET 
  name = 'Pro',
  tokens_per_month = 250,
  price_monthly = 1999, -- $19.99
  price_yearly = 19990, -- $199.90
  features = '["250 tokens per month", "Premium AI voices", "High quality audio", "Priority support", "Unlimited voice clones", "API access"]'::jsonb
WHERE id = 'enterprise';

-- Add Premium plan
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price_monthly,
  price_yearly,
  tokens_per_month,
  features,
  stripe_price_id_monthly,
  stripe_price_id_yearly,
  is_active,
  created_at
) VALUES (
  'premium',
  'Premium',
  'For power users and businesses',
  4999, -- $49.99
  49990, -- $499.90
  500,
  '["500 tokens per month", "All premium features", "Ultra-high quality", "24/7 support", "White-label options", "Custom integrations", "Advanced analytics"]'::jsonb,
  'price_premium_monthly',
  'price_premium_yearly',
  true,
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  tokens_per_month = EXCLUDED.tokens_per_month,
  features = EXCLUDED.features,
  updated_at = now();
