import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function signup(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, password: hash });
    res.status(201).json({ message: "User created" }); // { message: string }
  } catch (err) {
    // remonter les erreurs telles quelles (unicité, etc.)
    res.status(400).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Paire login/mot de passe incorrecte" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Paire login/mot de passe incorrecte" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });
    res.json({ userId: user._id, token }); // { userId, token }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
