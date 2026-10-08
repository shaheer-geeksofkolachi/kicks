/**
 * Run a SQL file against the Supabase Postgres database.
 *
 * Set one of:
 * - DATABASE_URL (full postgres URI from Supabase → Database → Connection string)
 * - SUPABASE_DB_PASSWORD (database password; uses project ref from NEXT_PUBLIC_SUPABASE_URL)
 * - SUPABASE_ACCESS_TOKEN (Supabase dashboard access token → Management API)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

const sqlPath = resolve(process.argv[2] ?? "supabase/add_product_reviews.sql");
const sql = readFileSync(sqlPath, "utf8");

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
  /^https:\/\/([^.]+)\.supabase\.co/,
)?.[1];

async function viaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token || !projectRef) return false;

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("Management API error:", res.status, body);
    process.exit(1);
  }
  console.log("Migration applied via Supabase Management API.");
  return true;
}

async function viaPg() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && process.env.SUPABASE_DB_PASSWORD && projectRef) {
    const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
    connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
  }
  if (!connectionString) return false;

  const pg = await import("pg");
  const client = new pg.default.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Migration applied via Postgres:", sqlPath);
  } finally {
    await client.end();
  }
  return true;
}

if (await viaManagementApi()) process.exit(0);
if (await viaPg()) process.exit(0);

console.error(
  "Missing database credentials. Add one of these to .env.local:\n" +
    "  DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres\n" +
    "  SUPABASE_DB_PASSWORD=<Database password from Supabase dashboard>\n" +
    "  SUPABASE_ACCESS_TOKEN=<Personal access token from supabase.com/dashboard/account/tokens>",
);
process.exit(1);
