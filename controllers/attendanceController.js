import Attendance from "../models/Attendance.js";

const today = () => new Date().toISOString().slice(0, 10);

export const checkIn = async (req, res) => {
  const date = today();
  if (await Attendance.findOne({ user: req.user._id, date }))
    return res.status(400).json({ success: false, message: "Already checked in" });

  const now = new Date();
  const late = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15); // 9:15 ke baad late
  const rec = await Attendance.create({
    user: req.user._id, date, checkIn: now, status: late ? "late" : "present",
  });
  res.status(201).json({ success: true, attendance: rec });
};

export const checkOut = async (req, res) => {
  const rec = await Attendance.findOne({ user: req.user._id, date: today() });
  if (!rec) return res.status(400).json({ success: false, message: "Check in first" });
  if (rec.checkOut) return res.status(400).json({ success: false, message: "Already checked out" });
  rec.checkOut = new Date();
  await rec.save();
  res.json({ success: true, attendance: rec });
};

export const myAttendance = async (req, res) => {
  const { month } = req.query; // YYYY-MM
  const filter = { user: req.user._id };
  if (month) filter.date = { $regex: `^${month}` };
  const records = await Attendance.find(filter).sort("-date");
  res.json({ success: true, records });
};

export const allAttendance = async (req, res) => {
  const { date, month, userId } = req.query;
  const filter = {};
  if (date) filter.date = date;
  if (month) filter.date = { $regex: `^${month}` };
  if (userId) filter.user = userId;
  const records = await Attendance.find(filter).populate("user", "name department").sort("-date");
  res.json({ success: true, records });
};

// HR manual correction
export const markAttendance = async (req, res) => {
  const { userId, date, status } = req.body;
  const rec = await Attendance.findOneAndUpdate(
    { user: userId, date }, { status }, { upsert: true, new: true }
  );
  res.json({ success: true, attendance: rec });
};