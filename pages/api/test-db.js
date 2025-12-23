import conn from "../../lib/db";

export default async function handler(req, res) {
  try {
    // 1. Check if env variables are even loaded
    const config = {
      user: process.env.PGSQL_USER ? "✅ Loaded" : "❌ Missing",
      database: process.env.PGSQL_DATABASE ? "✅ Loaded" : "❌ Missing",
      host: process.env.PGSQL_HOST ? "✅ Loaded" : "❌ Missing",
    };

    // 2. Try a simple query
    const result = await conn.query(
      "SELECT NOW() as time, current_database() as db_name"
    );

    res.status(200).json({
      status: "Connected successfully! 🚀",
      config: config,
      db_info: result.rows[0],
      message: "Your database is reachable and working.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Connection Failed ❌",
      error: error.message,
      code: error.code,
      hint: "Check your .env.local file and ensure PostgreSQL is running.",
      details: error,
    });
  }
}
