import conn from "../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Edit an existing transaction. Only the fields provided are changed
// (COALESCE keeps the current value for anything sent as null/undefined).
export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  const uid = session?.user?.uid;
  if (!uid) {
    res.status(401).end();
    return;
  }
  try {
    const { id, title, expense, type, details, category } = req.body;
    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }
    // The user_id guard ensures a user can only edit their own rows.
    const query = `
      UPDATE expenses SET
        expense_title  = COALESCE($2, expense_title),
        expense_details = COALESCE($3, expense_details),
        expense        = COALESCE($4, expense),
        expense_type   = COALESCE($5, expense_type),
        category       = COALESCE($6, category),
        updated_date   = $7
      WHERE expense_id = $1 AND user_id = $8`;
    const values = [
      id,
      title ?? null,
      details ?? null,
      expense ?? null,
      type ?? null,
      category ?? null,
      new Date(),
      uid,
    ];
    const result = await conn.query(query, values);
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error in updateexpense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
