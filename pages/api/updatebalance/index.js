import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query = "UPDATE balance SET current_balance = $1";
    const values = [req.body.balance];
    const result = await conn.query(query, values);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
