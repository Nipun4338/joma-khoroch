import conn from "../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  const uid = session?.user?.uid;
  if (!uid) {
    res.status(401).end();
    return;
  }
  try {
    const result = await conn.query(
      "SELECT current_balance from balance where user_id = $1",
      [uid]
    );
    // New users have no balance row yet → report 0 (same shape the client reads).
    res
      .status(200)
      .json({ rows: result.rows.length ? result.rows : [{ current_balance: 0 }] });
  } catch (error) {
    console.error("Database error in getbalance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
