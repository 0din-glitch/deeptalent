-- 009_external_jobs_cache.sql
-- Cache of REMOTE-ONLY jobs aggregated from public job boards, refreshed by a
-- daily cron (/api/cron/external-jobs). The public API reads from this table
-- so page views never hit the upstream boards directly.

create table if not exists external_jobs (
  id           text primary key,          -- stable per-source id, e.g. "remotive-12345"
  company      text not null,
  title        text not null,
  category     text,
  location     text,
  remote       boolean not null default true,
  url          text not null,
  source       text not null,
  salary       text,                       -- raw stated salary text (used server-side only)
  tags         text[] default '{}',
  posted_at    timestamptz not null default now(),
  refreshed_at timestamptz not null default now()
);

create index if not exists external_jobs_posted_idx   on external_jobs (posted_at desc);
create index if not exists external_jobs_category_idx on external_jobs (category);

-- RLS: the cache is public, read-only content. Writes happen via the service
-- role from the cron (service role bypasses RLS).
alter table external_jobs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'external_jobs' and policyname = 'external_jobs_public_read'
  ) then
    create policy external_jobs_public_read on external_jobs
      for select using (true);
  end if;
end $$;

-- "Submit through DeepTalent": marks outbound applications the applicant asked
-- DeepTalent to submit on their behalf (a warm, in-network-assisted apply).
alter table outbound_applications
  add column if not exists via_deeptalent boolean not null default false;
