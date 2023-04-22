import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    //console.log("req nom", req.body);
    const query = "SELECT current_balance from balance";
    //const values = [req.body.content];
    const result = await conn.query(query);
    //console.log("ttt", result);
    res.send(result);
  } catch (error) {
    //console.log(error);
  }
};
