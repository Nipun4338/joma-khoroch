import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    //console.log("req nom", req.body);
    const query = "SELECT expense_id, expense_title, expense_details, created_date, updated_date, status, expense from expenses order by created_date desc";
    //const values = [req.body.content];
    const result = await conn.query(query);
    //console.log("ttt", result);
    res.send(result);
  } catch (error) {
    //console.log(error);
  }
};
