// db.js
import { Pool } from "pg";

let conn;

if (!conn) {
  const isLocal =
    process.env.PGSQL_HOST === "localhost" ||
    process.env.PGSQL_HOST === "127.0.0.1";

  conn = new Pool({
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: process.env.PGSQL_PORT,
    database: process.env.PGSQL_DATABASE,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

export default conn;
