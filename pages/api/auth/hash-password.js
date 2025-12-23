import bcrypt from "bcryptjs";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    res.status(200).json({
      original: password,
      hash: hash,
      instructions:
        "Copy the hash and update your 'users' table in the database.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error hashing password", error: error.message });
  }
};
