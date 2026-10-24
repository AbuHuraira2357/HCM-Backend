import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

export const stats = async (req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  const [employees, presentToday, lateToday, pendingLeaves, onLeaveToday] = await Promise.all([
    User.countDocuments({ role: "employee", isActive: true }),
    Attendance.countDocuments({ date, status: { $in: ["present", "late"] } }),
    Attendance.countDocuments({ date, status: "late" }),
    Leave.countDocuments({ status: "pending" }),
    Leave.countDocuments({ status: "approved", from: { $lte: new Date() }, to: { $gte: new Date() } }),
  ]);
  res.json({ success: true, stats: { employees, presentToday, lateToday, pendingLeaves, onLeaveToday } });
};