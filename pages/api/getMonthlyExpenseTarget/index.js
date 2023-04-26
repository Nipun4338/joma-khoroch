import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query = "SELECT monthly_expense_target from insights";
    const result = await conn.query(query);
    res.send(result);
  } catch (error) {}
};
