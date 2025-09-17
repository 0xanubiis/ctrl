-- Create admin role check function
create or replace function is_admin(user_uuid uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Check if user has admin role in metadata or is in admin list
  -- For now, we'll use a simple email check - in production, use proper role management
  return exists (
    select 1 from auth.users 
    where id = user_uuid 
    and (
      raw_user_meta_data ->> 'role' = 'admin' 
      or email in ('admin@example.com') -- Add admin emails here
    )
  );
end;
$$;

-- Function to get all users with subscription info (admin only)
create or replace function get_all_users_admin()
returns table (
  user_id uuid,
  email text,
  full_name text,
  created_at timestamp with time zone,
  subscription_plan text,
  subscription_status text,
  total_tokens_used bigint,
  last_activity timestamp with time zone
)
language plpgsql
security definer
as $$
begin
  -- Check if current user is admin
  if not is_admin(auth.uid()) then
    raise exception 'Access denied. Admin privileges required.';
  end if;

  return query
  select 
    p.id as user_id,
    p.email,
    p.full_name,
    p.created_at,
    coalesce(sp.name, 'Free') as subscription_plan,
    coalesce(s.status, 'free') as subscription_status,
    coalesce(sum(ul.tokens_consumed), 0) as total_tokens_used,
    max(ul.created_at) as last_activity
  from profiles p
  left join subscriptions s on p.id = s.user_id and s.status = 'active'
  left join subscription_plans sp on s.plan_id = sp.id
  left join usage_logs ul on p.id = ul.user_id
  group by p.id, p.email, p.full_name, p.created_at, sp.name, s.status
  order by p.created_at desc;
end;
$$;

-- Function to get system analytics (admin only)
create or replace function get_system_analytics()
returns table (
  total_users bigint,
  active_subscriptions bigint,
  total_revenue numeric,
  tokens_consumed_today bigint,
  tokens_consumed_month bigint,
  files_generated_today bigint,
  files_generated_month bigint
)
language plpgsql
security definer
as $$
begin
  -- Check if current user is admin
  if not is_admin(auth.uid()) then
    raise exception 'Access denied. Admin privileges required.';
  end if;

  return query
  select 
    (select count(*) from profiles) as total_users,
    (select count(*) from subscriptions where status = 'active') as active_subscriptions,
    (select coalesce(sum(
      case 
        when sp.price_monthly > 0 then sp.price_monthly::numeric / 100
        else 0
      end
    ), 0) from subscriptions s 
    join subscription_plans sp on s.plan_id = sp.id 
    where s.status = 'active') as total_revenue,
    (select coalesce(sum(tokens_consumed), 0) from usage_logs 
     where created_at >= current_date) as tokens_consumed_today,
    (select coalesce(sum(tokens_consumed), 0) from usage_logs 
     where created_at >= date_trunc('month', current_date)) as tokens_consumed_month,
    (select count(*) from audio_files 
     where created_at >= current_date) as files_generated_today,
    (select count(*) from audio_files 
     where created_at >= date_trunc('month', current_date)) as files_generated_month;
end;
$$;

-- Function to get usage analytics by day (admin only)
create or replace function get_usage_analytics_by_day(days_back integer default 30)
returns table (
  date date,
  tokens_consumed bigint,
  files_generated bigint,
  new_users bigint
)
language plpgsql
security definer
as $$
begin
  -- Check if current user is admin
  if not is_admin(auth.uid()) then
    raise exception 'Access denied. Admin privileges required.';
  end if;

  return query
  select 
    d.date,
    coalesce(ul.tokens_consumed, 0) as tokens_consumed,
    coalesce(af.files_generated, 0) as files_generated,
    coalesce(nu.new_users, 0) as new_users
  from (
    select generate_series(
      current_date - interval '1 day' * days_back,
      current_date,
      interval '1 day'
    )::date as date
  ) d
  left join (
    select 
      created_at::date as date,
      sum(tokens_consumed) as tokens_consumed
    from usage_logs
    where created_at >= current_date - interval '1 day' * days_back
    group by created_at::date
  ) ul on d.date = ul.date
  left join (
    select 
      created_at::date as date,
      count(*) as files_generated
    from audio_files
    where created_at >= current_date - interval '1 day' * days_back
    group by created_at::date
  ) af on d.date = af.date
  left join (
    select 
      created_at::date as date,
      count(*) as new_users
    from profiles
    where created_at >= current_date - interval '1 day' * days_back
    group by created_at::date
  ) nu on d.date = nu.date
  order by d.date;
end;
$$;
