-- Create voice clones table
create table if not exists public.voice_clones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  elevenlabs_voice_id text unique,
  sample_audio_url text,
  status text not null default 'training', -- training, ready, failed
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on voice_clones
alter table public.voice_clones enable row level security;

-- Voice clones policies
create policy "voice_clones_select_own"
  on public.voice_clones for select
  using (auth.uid() = user_id);

create policy "voice_clones_insert_own"
  on public.voice_clones for insert
  with check (auth.uid() = user_id);

create policy "voice_clones_update_own"
  on public.voice_clones for update
  using (auth.uid() = user_id);

create policy "voice_clones_delete_own"
  on public.voice_clones for delete
  using (auth.uid() = user_id);

-- Create audio files table for storing generated content
create table if not exists public.audio_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  filename text not null,
  original_text text,
  voice_id text,
  voice_clone_id uuid references public.voice_clones(id) on delete set null,
  file_url text,
  file_size integer,
  duration_seconds integer,
  format text default 'mp3',
  quality text default 'standard',
  usage_type text default 'tts',
  is_favorite boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on audio_files
alter table public.audio_files enable row level security;

-- Audio files policies
create policy "audio_files_select_own"
  on public.audio_files for select
  using (auth.uid() = user_id);

create policy "audio_files_insert_own"
  on public.audio_files for insert
  with check (auth.uid() = user_id);

create policy "audio_files_update_own"
  on public.audio_files for update
  using (auth.uid() = user_id);

create policy "audio_files_delete_own"
  on public.audio_files for delete
  using (auth.uid() = user_id);
