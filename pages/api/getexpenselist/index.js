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
      "SELECT expense_id, expense_title, expense_details, created_date, updated_date, status, expense, expense_type, category from expenses where user_id = $1 order by created_date desc";
    const result = await conn.query(query, [uid]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error in getexpenselist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
