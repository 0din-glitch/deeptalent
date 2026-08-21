import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("[migrate] No POSTGRES_URL_NON_POOLING / POSTGRES_URL set");
  process.exit(1);
}

const SQL = readFileSync(join(__dirname, "db", "009_external_jobs_cache.sql"), "utf8");

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
  console.log("[migrate] external_jobs cache table + via_deeptalent column ready");
} catch (err) {
  console.error("[migrate] sql error:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
