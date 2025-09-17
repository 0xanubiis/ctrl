-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  );
  
  -- Create free subscription
  insert into public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  values (
    new.id,
    'free',
    'active',
    now(),
    now() + interval '1 month'
  );
  
  -- Initialize token usage for different types
  insert into public.token_usage (user_id, tokens_used, tokens_remaining, usage_type, reset_date)
  values 
    (new.id, 0, 1000, 'tts', date_trunc('month', now()) + interval '1 month'),
    (new.id, 0, 1000, 'stt', date_trunc('month', now()) + interval '1 month'),
    (new.id, 0, 1000, 'voice_clone', date_trunc('month', now()) + interval '1 month');
  
  return new;
end;
$$;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at triggers to relevant tables
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();

create trigger update_token_usage_updated_at
  before update on token_usage
  for each row
  execute function update_updated_at_column();

create trigger update_voice_clones_updated_at
  before update on voice_clones
  for each row
  execute function update_updated_at_column();
