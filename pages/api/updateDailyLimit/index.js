import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query = "UPDATE insights SET daily_limit = $1";
    const values = [req.body.dailyLimit];
    const result = await conn.query(query, values);
    res.send(result);
  } catch (error) {}
};
