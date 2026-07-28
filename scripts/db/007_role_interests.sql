-- 007_role_interests.sql
-- Stores expressions of interest submitted from /roles.

create table if not exists role_interests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null,
  name        text,
  role_id     text not null,    -- SALARY_SCALE id e.g. "fpa-analyst"
  role_label  text not null,
  message     text,
  source      text default 'roles_page'
);

create index if not exists role_interests_email_idx   on role_interests (email);
create index if not exists role_interests_role_id_idx on role_interests (role_id);

-- RLS: only admins can read; inserts are open (service role used from API route).
alter table role_interests enable row level security;

create policy role_interests_admin_all on role_interests
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );
