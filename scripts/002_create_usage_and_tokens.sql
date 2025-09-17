-- Create token usage tracking table
create table if not exists public.token_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  tokens_used integer not null default 0,
  tokens_remaining integer not null,
  usage_type text not null, -- 'tts', 'stt', 'voice_clone', 'api'
  reset_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on token_usage
alter table public.token_usage enable row level security;

-- Token usage policies
create policy "token_usage_select_own"
  on public.token_usage for select
  using (auth.uid() = user_id);

create policy "token_usage_insert_own"
  on public.token_usage for insert
  with check (auth.uid() = user_id);

create policy "token_usage_update_own"
  on public.token_usage for update
  using (auth.uid() = user_id);

-- Create usage logs table for detailed tracking
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_type text not null, -- 'tts', 'stt', 'voice_clone'
  tokens_consumed integer not null,
  input_text text,
  output_url text,
  voice_id text,
  model_used text,
  quality_setting text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on usage_logs
alter table public.usage_logs enable row level security;

-- Usage logs policies
create policy "usage_logs_select_own"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "usage_logs_insert_own"
  on public.usage_logs for insert
  with check (auth.uid() = user_id);
