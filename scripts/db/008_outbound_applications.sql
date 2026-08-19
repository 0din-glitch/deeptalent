-- 008_outbound_applications.sql
-- Tracks "outbound" applications: when a talent applies to a job OUTSIDE the
-- DeepTalent network (an external listing aggregated on the apply/talents page).
-- Each row also snapshots the salary economics used to pitch an in-network
-- alternative: the market/stated salary and DeepTalent's rate at -30%.

create table if not exists outbound_applications (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),

  -- Who applied (nullable — visitors may not be signed in)
  applicant_user_id  uuid,
  applicant_name     text,
  applicant_email    text,

  -- The external job they applied to (snapshot — external ids are not stable)
  external_job_id    text,
  external_title     text not null,
  external_company   text,
  external_source    text,
  external_url       text,
  external_location  text,
  external_category  text,

  -- Salary economics (USD monthly). market_salary_usd is the stated/benchmark
  -- rate; dt_rate_usd is that figure minus 30% (DeepTalent in-network price).
  matched_role_id    text,       -- SALARY_SCALE id, e.g. "full-stack-developer"
  matched_role_label text,
  market_salary_usd  integer,
  dt_rate_usd        integer,    -- market_salary_usd * 0.70, rounded
  in_network_count   integer default 0
);

create index if not exists outbound_apps_email_idx   on outbound_applications (applicant_email);
create index if not exists outbound_apps_role_idx    on outbound_applications (matched_role_id);
create index if not exists outbound_apps_created_idx on outbound_applications (created_at desc);

-- RLS: reads restricted to admins; writes happen via the service role from the
-- public tracking API (service role bypasses RLS), so no public insert policy.
alter table outbound_applications enable row level security;

create policy outbound_apps_admin_read on outbound_applications
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );
