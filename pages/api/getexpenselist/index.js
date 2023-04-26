import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query =
      "SELECT expense_id, expense_title, expense_details, created_date, updated_date, status, expense, expense_type from expenses order by created_date desc";
    const result = await conn.query(query);
    res.status(200).json(result);
  } catch (error) {}
};
