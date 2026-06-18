-- 005_placements.sql
-- Tracks talent placed at companies, managed by admins.

create table if not exists placements (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- talent
  talent_user_id      uuid references profiles(id) on delete set null,
  talent_name         text not null,
  talent_email        text not null,
  talent_role         text,
  talent_seniority    text,

  -- company
  company_user_id     uuid references profiles(id) on delete set null,
  company_name        text not null,
  company_contact     text,
  company_email       text,

  -- placement details
  start_date          date,
  end_date            date,
  status              text not null default 'active', -- active | ended | on_hold
  monthly_rate_usd    numeric(12,2),
  currency            text not null default 'USD',
  notes               text,

  -- admin who created the placement
  placed_by           uuid references profiles(id) on delete set null,
  placed_by_email     text
);

-- index for fast talent and company lookups
create index if not exists placements_talent_idx   on placements(talent_user_id);
create index if not exists placements_company_idx  on placements(company_user_id);
create index if not exists placements_status_idx   on placements(status);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists placements_updated_at on placements;
create trigger placements_updated_at
  before update on placements
  for each row execute function set_updated_at();

-- RLS
alter table placements enable row level security;

-- admins have full access
create policy placements_admin_all on placements
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- talent can read their own placements
create policy placements_talent_select on placements
  for select
  using (talent_user_id = auth.uid());

-- companies can read their own placements
create policy placements_company_select on placements
  for select
  using (company_user_id = auth.uid());
