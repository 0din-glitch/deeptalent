-- AI Interview feature schema
create extension if not exists "pgcrypto";

create table if not exists public.talent_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_name text not null,
  email text,
  role_category text,
  specialization text,
  seniority text,
  skills text[] default '{}',
  years_experience numeric,
  -- interview content
  questions jsonb default '[]'::jsonb,      -- [{id, question}]
  answers jsonb default '[]'::jsonb,        -- [{questionId, question, transcript, score, feedback}]
  overall_score integer,                    -- 0-100
  score_band text,                          -- 'excellent' | 'strong' | 'promising' | 'developing'
  ai_summary text,
  strengths text[] default '{}',
  improvements text[] default '{}',
  -- video
  video_path text,                          -- storage path in interview-videos bucket
  video_duration_seconds integer,
  -- lifecycle
  status text not null default 'in_progress', -- 'in_progress' | 'completed'
  qualified_roles jsonb default '[]'::jsonb,   -- [{id,label,seniority,score}]
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists talent_interviews_user_id_idx on public.talent_interviews(user_id);
create index if not exists talent_interviews_created_at_idx on public.talent_interviews(created_at desc);

alter table public.talent_interviews enable row level security;

-- Users manage their own interviews
drop policy if exists "interviews_select_own" on public.talent_interviews;
create policy "interviews_select_own" on public.talent_interviews
  for select using (auth.uid() = user_id);

drop policy if exists "interviews_insert_own" on public.talent_interviews;
create policy "interviews_insert_own" on public.talent_interviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "interviews_update_own" on public.talent_interviews;
create policy "interviews_update_own" on public.talent_interviews
  for update using (auth.uid() = user_id);

drop policy if exists "interviews_delete_own" on public.talent_interviews;
create policy "interviews_delete_own" on public.talent_interviews
  for delete using (auth.uid() = user_id);
