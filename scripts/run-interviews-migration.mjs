import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("[migrate] No POSTGRES_URL_NON_POOLING / POSTGRES_URL set");
  process.exit(1);
}

const SQL = readFileSync(join(__dirname, "db", "004_talent_interviews.sql"), "utf8");

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
  console.log("[migrate] talent_interviews table + RLS ready");
} catch (err) {
  console.error("[migrate] sql error:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

// Create private storage bucket for interview videos
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (url && serviceKey) {
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: buckets } = await sb.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "interview-videos");
  if (!exists) {
    const { error } = await sb.storage.createBucket("interview-videos", {
      public: false,
      fileSizeLimit: "104857600", // 100MB
      allowedMimeTypes: ["video/webm", "video/mp4"],
    });
    if (error) console.error("[migrate] bucket error:", error.message);
    else console.log("[migrate] interview-videos bucket created (private)");
  } else {
    console.log("[migrate] interview-videos bucket already exists");
  }
} else {
  console.warn("[migrate] missing Supabase env, skipped bucket creation");
}
