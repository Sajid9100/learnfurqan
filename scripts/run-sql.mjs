// Run a SQL file (or inline SQL) against the project's Supabase Postgres
// via the session pooler. Wraps the whole script in a single transaction so
// a syntax error rolls back any partial DDL.
//
// Usage:
//   node --env-file=.env.local scripts/run-sql.mjs path/to/file.sql
//   echo "select now();" | node --env-file=.env.local scripts/run-sql.mjs
//
// Requires DATABASE_URL in env.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL in env (.env.local).");
  process.exit(1);
}

const arg = process.argv[2];
let sql = "";
if (arg) {
  sql = readFileSync(resolve(arg), "utf8");
} else if (!process.stdin.isTTY) {
  sql = readFileSync(0, "utf8");
} else {
  console.error("Usage: node --env-file=.env.local scripts/run-sql.mjs <file.sql>");
  process.exit(1);
}

if (!sql.trim()) {
  console.error("No SQL provided.");
  process.exit(1);
}

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log("✓ SQL applied successfully.");
} catch (err) {
  try {
    await client.query("rollback");
  } catch {}
  console.error("✗ Failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
