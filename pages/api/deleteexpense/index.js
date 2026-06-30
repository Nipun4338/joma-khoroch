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
    // Scope by user_id so one user can never delete another's row.
    const query = "DELETE FROM expenses WHERE expense_id = $1 AND user_id = $2";
    const result = await conn.query(query, [req.body.id, uid]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error in deleteexpense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
