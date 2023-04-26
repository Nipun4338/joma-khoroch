import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query = "UPDATE insights SET monthly_expense_target = $1";
    const values = [req.body.monthlyExpenseTarget];
    const result = await conn.query(query, values);
    res.send(result);
  } catch (error) {}
};
