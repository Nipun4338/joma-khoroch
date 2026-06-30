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
      INSERT INTO insights (user_id, monthly_expense_target) VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET monthly_expense_target = EXCLUDED.monthly_expense_target`;
    const result = await conn.query(query, [uid, req.body.monthlyExpenseTarget]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error in updateMonthlyExpenseTarget:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
