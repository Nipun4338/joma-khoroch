import conn from "../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    // Signed in
    try {
      const query =
        "SELECT expense_id, expense_title, expense_details, created_date, updated_date, status, expense, expense_type from expenses order by created_date desc";
      const result = await conn.query(query);
      res.status(200).json(result);
    } catch (error) {
      console.error("Database error in getexpenselist:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Not Signed in
    res.status(401).end();
  }
};
