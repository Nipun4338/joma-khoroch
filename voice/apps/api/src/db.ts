import { Pool } from "pg";
import { env } from "./env";

/** Single shared connection pool for the process. */
export const pool = new Pool({ connectionString: env.databaseUrl });

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params as never[]);
  return res.rows as T[];
}
