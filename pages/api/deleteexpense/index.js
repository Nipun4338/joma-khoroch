import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    //console.log("req nom", req.body)
    const query = "DELETE FROM expenses where expense_id = $1";
    const values = [req.body.id];
    console.log(req.body);
    const result = await conn.query(query, values);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
