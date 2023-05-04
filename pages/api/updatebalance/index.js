import conn from "../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    // Signed in
    try {
      const query = "UPDATE balance SET current_balance = $1";
      const values = [req.body.balance];
      const result = await conn.query(query, values);
      res.send(result);
    } catch (error) {}
  } else {
    // Not Signed in
    res.status(401);
  }
  res.end();
};
