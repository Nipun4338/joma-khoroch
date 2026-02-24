import conn from "../../../lib/db";
import bcrypt from "bcryptjs";

export default async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const query = "SELECT email, password, user_id FROM users WHERE email = $1";
    const values = [email];
    const result = await conn.query(query, values);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      id: user.user_id,
      email: user.email,
      message: "User matched!",
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
