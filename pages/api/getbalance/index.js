import conn from "../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    // Signed in
    try {
      const query = "SELECT current_balance from balance";
      const result = await conn.query(query);
      res.status(200).json(result);
    } catch (error) {
      console.error("Database error in getbalance:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Not Signed in
    res.status(401).end();
  }
};
