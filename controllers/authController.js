import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Pehla admin banane ke liye (sirf tab chalega jab koi admin na ho)
export const setupAdmin = async (req, res) => {
  if (await User.findOne({ role: "admin" }))
    return res.status(400).json({ success: false, message: "Admin already exists" });
  const { name, email, password } = req.body;
  const user = await User.create({
    name, email, role: "admin",
    password: await bcrypt.hash(password, 10),
  });
  res.status(201).json({ success: true, token: sign(user._id) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  if (!user.isActive)
    return res.status(403).json({ success: false, message: "Account disabled" });

  res.json({
    success: true,
    token: sign(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const me = (req, res) => res.json({ success: true, user: req.user });