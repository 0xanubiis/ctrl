-- Function to get user's current subscription with plan details
create or replace function get_user_subscription(user_uuid uuid)
returns table (
  subscription_id uuid,
  plan_id text,
  plan_name text,
  status text,
  tokens_per_month integer,
  billing_cycle text,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    s.id as subscription_id,
    s.plan_id,
    sp.name as plan_name,
    s.status,
    sp.tokens_per_month,
    s.billing_cycle,
    s.current_period_end,
    s.cancel_at_period_end
  from subscriptions s
  join subscription_plans sp on s.plan_id = sp.id
  where s.user_id = user_uuid
  and s.status = 'active'
  order by s.created_at desc
  limit 1;
end;
$$;

-- Function to get user's token usage for current period
create or replace function get_user_token_usage(user_uuid uuid)
returns table (
  tokens_used integer,
  tokens_remaining integer,
  reset_date timestamp with time zone,
  usage_type text
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    tu.tokens_used,
    tu.tokens_remaining,
    tu.reset_date,
    tu.usage_type
  from token_usage tu
  where tu.user_id = user_uuid
  and tu.reset_date > now();
end;
$$;

-- Function to consume tokens and log usage
create or replace function consume_tokens(
  user_uuid uuid,
  tokens_to_consume integer,
  usage_type_param text,
  input_text_param text default null,
  output_url_param text default null,
  voice_id_param text default null,
  metadata_param jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_tokens integer;
  usage_record record;
begin
  -- Get current token usage
  select tokens_remaining into current_tokens
  from token_usage
  where user_id = user_uuid
  and usage_type = usage_type_param
  and reset_date > now()
  limit 1;
  
  -- Check if user has enough tokens
  if current_tokens is null or current_tokens < tokens_to_consume then
    return false;
  end if;
  
  -- Update token usage
  update token_usage
  set 
    tokens_used = tokens_used + tokens_to_consume,
    tokens_remaining = tokens_remaining - tokens_to_consume,
    updated_at = now()
  where user_id = user_uuid
  and usage_type = usage_type_param
  and reset_date > now();
  
  -- Log the usage
  insert into usage_logs (
    user_id,
    usage_type,
    tokens_consumed,
    input_text,
    output_url,
    voice_id,
    metadata
  ) values (
    user_uuid,
    usage_type_param,
    tokens_to_consume,
    input_text_param,
    output_url_param,
    voice_id_param,
    metadata_param
  );
  
  return true;
end;
$$;

-- Function to reset monthly tokens
create or replace function reset_monthly_tokens()
returns void
language plpgsql
security definer
as $$
begin
  -- Reset tokens for all active subscriptions
  update token_usage
  set 
    tokens_used = 0,
    tokens_remaining = (
      select sp.tokens_per_month
      from subscriptions s
      join subscription_plans sp on s.plan_id = sp.id
      where s.user_id = token_usage.user_id
      and s.status = 'active'
      limit 1
    ),
    reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  where reset_date <= now();
end;
$$;
