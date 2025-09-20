-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create subscription plans table
create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  description text,
  price_monthly integer not null, -- in cents
  price_yearly integer not null, -- in cents
  tokens_per_month integer not null,
  features jsonb not null default '[]'::jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default subscription plans
insert into public.subscription_plans (id, name, description, price_monthly, price_yearly, tokens_per_month, features, stripe_price_id_monthly, stripe_price_id_yearly) values
  ('free', 'Free', 'Perfect for trying out our AI audio features', 0, 0, 1000, '["Text-to-Speech", "Basic Voice Selection", "Standard Quality"]'::jsonb, null, null),
  ('pro', 'Pro', 'Great for content creators and professionals', 1999, 19990, 10000, '["Text-to-Speech", "Speech-to-Text", "Premium Voices", "High Quality Audio", "Voice Cloning (3 voices)", "Priority Support"]'::jsonb, 'price_pro_monthly', 'price_pro_yearly'),
  ('enterprise', 'Enterprise', 'For teams and high-volume usage', 9999, 99990, 100000, '["Everything in Pro", "Unlimited Voice Cloning", "Custom Voice Training", "API Access", "White-label Options", "Dedicated Support"]'::jsonb, 'price_enterprise_monthly', 'price_enterprise_yearly')
on conflict (id) do nothing;

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.subscription_plans(id),
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text not null default 'active', -- active, canceled, past_due, incomplete
  billing_cycle text not null default 'monthly', -- monthly, yearly
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- Subscriptions policies
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id);
