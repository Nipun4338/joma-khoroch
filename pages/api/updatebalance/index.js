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
    // Upsert this user's single balance row.
    const query = `
      INSERT INTO balance (user_id, current_balance) VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET current_balance = EXCLUDED.current_balance`;
    const result = await conn.query(query, [uid, req.body.balance]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error in updatebalance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
