/** Applies schema.sql to the configured database. Idempotent (uses IF NOT EXISTS). */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pool } from "../db";

async function main() {
  const sql = readFileSync(join(__dirname, "..", "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("[db] schema applied");
  await pool.end();
}

main().catch((err) => {
  console.error("[db] setup failed:", err);
  process.exit(1);
});
