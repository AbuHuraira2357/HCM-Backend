import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

export const createUser = async (req, res) => {
  const { name, email, password, role = "employee", department, designation, basicSalary } = req.body;

  // HR sirf employee bana sakta hai, admin HR bhi bana sakta hai
  if (req.user.role === "hr" && role !== "employee")
    return res.status(403).json({ success: false, message: "HR can only create employees" });
  if (role === "admin")
    return res.status(403).json({ success: false, message: "Cannot create admin" });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(400).json({ success: false, message: "Email already exists" });

  const user = await User.create({
    name, email, role, department, designation, basicSalary,
    password: await bcrypt.hash(password, 10),
  });
  await AuditLog.create({ actor: req.user._id, action: "CREATE_USER", details: `${email} (${role})` });
  res.status(201).json({ success: true, user: { id: user._id, name, email, role } });
};

export const listUsers = async (req, res) => {
  const { search, department } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (department) filter.department = department;
  if (req.user.role === "hr") filter.role = "employee";
  const users = await User.find(filter).select("-password").sort("-createdAt");
  res.json({ success: true, users });
};

export const updateUser = async (req, res) => {
  const { password, role, ...rest } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true }).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, user });
};

export const toggleActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "Not found" });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, isActive: user.isActive });
};