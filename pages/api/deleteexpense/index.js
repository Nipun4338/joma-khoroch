import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query = "DELETE FROM expenses where expense_id = $1";
    const values = [req.body.id];
    const result = await conn.query(query, values);
    res.send(result);
  } catch (error) {}
};
