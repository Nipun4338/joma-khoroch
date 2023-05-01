import conn from "../../../lib/db";

export default async (req, res) => {
  try {
    const body = JSON.parse(JSON.stringify(req.body));
    const query = "SELECT email from users where password=$1";
    const values = [body.password];
    const result = await conn.query(query, values);
    if (result.rows[0]["email"] != body.email) {
      res.status(404).send({ message: "User does not exit!" });
      return;
    }
    res.status(200).send({ message: "User matched!" });
    return;
  } catch (error) {}
};
