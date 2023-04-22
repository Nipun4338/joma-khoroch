import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    //console.log("req nom", req.body)
    const query =
      "INSERT INTO expenses(expense_title, expense_details, created_date, updated_date, status, expense, expense_type) VALUES ($1, $2, $3, $4, $5, $6, $7)";
    const date = new Date();
    const values = [
      req.body.title,
      req.body.details,
      date,
      date,
      true,
      req.body.expense,
      req.body.type,
    ];
    const result = await conn.query(query, values);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
