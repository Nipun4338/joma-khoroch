// db.js
import { Pool } from "pg";

let conn;

if (!conn) {
  const isLocal =
    process.env.PGSQL_HOST === "localhost" ||
    process.env.PGSQL_HOST === "127.0.0.1";

  // Priority 1: Connection String (Standard for Vercel/Neon)
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (connectionString) {
    conn = new Pool({
      connectionString: connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  } else {
    // Priority 2: Individual variables (For Local Dev)
    conn = new Pool({
      user: process.env.PGSQL_USER,
      password: process.env.PGSQL_PASSWORD,
      host: process.env.PGSQL_HOST,
      port: process.env.PGSQL_PORT,
      database: process.env.PGSQL_DATABASE,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
}

export default conn;
