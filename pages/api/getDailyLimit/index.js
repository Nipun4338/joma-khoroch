import conn from "../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    // Signed in
    try {
      const query = "SELECT daily_limit from insights";
      const result = await conn.query(query);
      res.send(result);
    } catch (error) {}
  } else {
    // Not Signed in
    res.status(401);
  }
  res.end();
};
