import conn from "../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    // Signed in
    try {
      const query = "UPDATE insights SET monthly_expense_target = $1";
      const values = [req.body.monthlyExpenseTarget];
      const result = await conn.query(query, values);
      res.send(result);
    } catch (error) {}
  } else {
    // Not Signed in
    res.status(401);
  }
  res.end();
};
