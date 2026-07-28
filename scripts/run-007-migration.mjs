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

const SQL = readFileSync(join(__dirname, "db", "007_role_interests.sql"), "utf8");
const cleanedConnectionString = connectionString
  .replace(/([?&])sslmode=[^&]*/g, "$1")
  .replace(/[?&]$/, "");

const client = new Client({
  connectionString: cleanedConnectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("[migrate] Connected. Running 007_role_interests...");
  await client.query(SQL);
  console.log("[migrate] Done.");
} catch (err) {
  console.error("[migrate] Failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
