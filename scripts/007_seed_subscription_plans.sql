-- Creating subscription plans data for the pricing page
-- Insert subscription plans data
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
) VALUES 
(
  'free',
  'Free',
  'Perfect for getting started with AI audio',
  0,
  0,
  1000,
  '["1,000 tokens per month", "Basic AI voices", "Standard quality", "Email support", "5 voice clones"]'::jsonb,
  null,
  null,
  true,
  now()
),
(
  'pro',
  'Pro',
  'Best for professionals and content creators',
  1999,
  19990,
  10000,
  '["10,000 tokens per month", "Premium AI voices", "High quality audio", "Priority support", "Unlimited voice clones", "API access", "Custom voice training"]'::jsonb,
  'price_1234567890_monthly',
  'price_1234567890_yearly',
  true,
  now()
),
(
  'enterprise',
  'Enterprise',
  'For teams and large-scale applications',
  9999,
  99990,
  100000,
  '["100,000 tokens per month", "All premium features", "Ultra-high quality", "24/7 dedicated support", "White-label options", "Custom integrations", "Advanced analytics", "Team management"]'::jsonb,
  'price_0987654321_monthly',
  'price_0987654321_yearly',
  true,
  now()
);
