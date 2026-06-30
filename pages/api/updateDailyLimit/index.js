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
    const query = `
      INSERT INTO insights (user_id, daily_limit) VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET daily_limit = EXCLUDED.daily_limit`;
    const result = await conn.query(query, [uid, req.body.dailyLimit]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error in updateDailyLimit:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
