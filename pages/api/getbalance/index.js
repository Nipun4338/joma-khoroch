import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query = "SELECT current_balance from balance";
    const result = await conn.query(query);
    res.send(result);
  } catch (error) {}
};
