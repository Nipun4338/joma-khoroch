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
    const query =
      "INSERT INTO expenses(expense_title, expense_details, created_date, updated_date, status, expense, expense_type, category, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    const date = new Date();
    const values = [
      req.body.title,
      req.body.details,
      date,
      date,
      true,
      req.body.expense,
      req.body.type,
      req.body.category ?? null,
      uid,
    ];
    const result = await conn.query(query, values);
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error in insertexpense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
