import Leave from "../models/Leave.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

export const applyLeave = async (req, res) => {
  const { type, from, to, reason } = req.body;
  const days = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  if (days < 1) return res.status(400).json({ success: false, message: "Invalid dates" });
  if (days > req.user.leaveBalance)
    return res.status(400).json({ success: false, message: "Insufficient leave balance" });

  const leave = await Leave.create({ user: req.user._id, type, from, to, reason, days });
  res.status(201).json({ success: true, leave });
};

export const myLeaves = async (req, res) => {
  const leaves = await Leave.find({ user: req.user._id }).sort("-createdAt");
  res.json({ success: true, leaves, balance: req.user.leaveBalance });
};

export const allLeaves = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const leaves = await Leave.find(filter).populate("user", "name department").sort("-createdAt");
  res.json({ success: true, leaves });
};

export const reviewLeave = async (req, res) => {
  const { status } = req.body; // approved | rejected
  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ success: false, message: "Invalid status" });

  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: "Not found" });
  if (leave.status !== "pending")
    return res.status(400).json({ success: false, message: "Already reviewed" });

  leave.status = status;
  leave.reviewedBy = req.user._id;
  await leave.save();

  if (status === "approved") {
    await User.findByIdAndUpdate(leave.user, { $inc: { leaveBalance: -leave.days } });
    // Har leave din ki attendance "leave" mark karo
    for (let d = new Date(leave.from); d <= leave.to; d.setDate(d.getDate() + 1)) {
      await Attendance.findOneAndUpdate(
        { user: leave.user, date: d.toISOString().slice(0, 10) },
        { status: "leave" }, { upsert: true }
      );
    }
  }
  res.json({ success: true, leave });
};