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
    await conn.query(
      "INSERT INTO insights (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
      [uid]
    );
    const result = await conn.query(
      "SELECT monthly_expense_target from insights where user_id = $1",
      [uid]
    );
    res.status(200).json({ rows: result.rows });
  } catch (error) {
    console.error("Database error in getMonthlyExpenseTarget:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
