import pg from "pg";

const { Client } = pg;

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("[migrate] No POSTGRES_URL_NON_POOLING / POSTGRES_URL set");
  process.exit(1);
}

const SQL = `
create table if not exists public.rejected_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id uuid not null,
  email text,
  full_name text,
  reason text,
  snapshot jsonb not null,
  rejected_by uuid,
  rejected_by_email text,
  created_at timestamptz not null default now()
);

create index if not exists rejected_snapshots_source_idx
  on public.rejected_snapshots (source_table, created_at desc);

alter table public.rejected_snapshots enable row level security;

drop policy if exists rs_admin_all on public.rejected_snapshots;
create policy rs_admin_all on public.rejected_snapshots
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or p.is_super_admin = true)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or p.is_super_admin = true)
    )
  );
`;

// Strip sslmode from the URL so our explicit ssl object (which disables
// cert verification for Supabase's self-signed chain) takes effect.
const cleanedConnectionString = connectionString.replace(
  /([?&])sslmode=[^&]*/g,
  "$1"
).replace(/[?&]$/, "");

const client = new Client({
  connectionString: cleanedConnectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(SQL);
  console.log("[migrate] rejected_snapshots table ready");
} catch (err) {
  console.error("[migrate] error:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
