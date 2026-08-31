-- Tracks completion of the NYSC "Get Global Workforce Ready" course and the
-- resulting certificate, self-reported by the corps member and/or issued
-- directly by an admin from the Corps Members tab.
alter table public.profiles
  add column if not exists nysc_course_completed_at timestamptz,
  add column if not exists nysc_course_completed_source text
    check (nysc_course_completed_source in ('self_reported', 'admin_issued')),
  add column if not exists nysc_certificate_number text unique,
  add column if not exists nysc_certificate_issued_at timestamptz,
  add column if not exists nysc_certificate_sent_at timestamptz;

create index if not exists profiles_nysc_certificate_number_idx
  on public.profiles (nysc_certificate_number)
  where nysc_certificate_number is not null;
