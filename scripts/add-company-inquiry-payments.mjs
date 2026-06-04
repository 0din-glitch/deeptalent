import pg from "pg";

const { Client } = pg;

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("[migrate] No POSTGRES_URL_NON_POOLING / POSTGRES_URL set");
  process.exit(1);
}

const SQL = `
alter table public.company_inquiries
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists paid_at timestamptz,
  add column if not exists amount_paid_cents bigint,
  add column if not exists stripe_session_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_customer_id text;

create index if not exists company_inquiries_payment_status_idx
  on public.company_inquiries (payment_status, paid_at desc);
`;

// Strip sslmode from the URL so our explicit ssl object (which disables
// cert verification for Supabase's self-signed chain) takes effect.
const cleanedConnectionString = connectionString
  .replace(/([?&])sslmode=[^&]*/g, "$1")
  .replace(/[?&]$/, "");

const client = new Client({
  connectionString: cleanedConnectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(SQL);
  console.log("[migrate] company_inquiries payment columns ready");
} catch (err) {
  console.error("[migrate] error:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
