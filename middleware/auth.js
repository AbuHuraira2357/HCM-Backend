import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Token required" });

    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: "User not found or inactive" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: "Access denied" });
  next();
};