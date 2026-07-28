-- 006_profiles_unique_email.sql
-- Prevents duplicate profile rows for the same email address.

-- Step 1: remove duplicate rows, keeping the oldest (smallest created_at) per email.
-- Using a CTE so we target only the extras.
with ranked as (
  select
    id,
    email,
    row_number() over (partition by email order by created_at asc) as rn
  from public.profiles
  where email is not null
)
delete from public.profiles
where id in (
  select id from ranked where rn > 1
);

-- Step 2: index for fast lookups (idempotent).
create index if not exists profiles_email_idx on public.profiles (email);

-- Step 3: unique constraint (idempotent via DO block).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_email_unique'
  ) then
    alter table public.profiles
      add constraint profiles_email_unique unique (email);
  end if;
end $$;
