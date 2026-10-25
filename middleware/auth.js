import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || typeof header !== "string")
      return res.status(401).json({ success: false, message: "Token required" });

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token)
      return res.status(401).json({ success: false, message: "Token required" });

    const secret = process.env.JWT_SECRET;
    if (!secret)
      return res.status(500).json({ success: false, message: "JWT secret is not configured" });

    const decoded = jwt.verify(token, secret);
    if (!decoded || !decoded.id)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: "User not found or inactive" });

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const allow = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.role)
    return res.status(401).json({ success: false, message: "Authentication required" });

  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: "Access denied" });

  return next();
};