import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const query = "SELECT daily_limit from insights";
    const result = await conn.query(query);
    res.send(result);
  } catch (error) {}
};
