import Payroll from "../models/Payroll.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import AuditLog from "../models/AuditLog.js";

const WORKING_DAYS = 26;

// HR: month ke liye payroll prepare (draft)
export const preparePayroll = async (req, res) => {
  const { month } = req.body; // YYYY-MM
  const employees = await User.find({ role: "employee", isActive: true });
  const results = [];

  for (const emp of employees) {
    const existing = await Payroll.findOne({ user: emp._id, month });
    if (existing?.status === "finalized") { results.push(existing); continue; }

    const records = await Attendance.find({ user: emp._id, date: { $regex: `^${month}` } });
    const presentDays = records.filter(r => ["present", "late", "leave"].includes(r.status)).length;
    const absentDays = Math.max(WORKING_DAYS - presentDays, 0);
    const deduction = Math.round((emp.basicSalary / WORKING_DAYS) * absentDays);
    const netSalary = emp.basicSalary - deduction;

    const doc = await Payroll.findOneAndUpdate(
      { user: emp._id, month },
      { basicSalary: emp.basicSalary, presentDays, absentDays, deduction, netSalary, status: "draft" },
      { upsert: true, new: true }
    );
    results.push(doc);
  }
  res.json({ success: true, payroll: results });
};

// Admin: finalize
export const finalizePayroll = async (req, res) => {
  const { month } = req.body;
  const r = await Payroll.updateMany({ month, status: "draft" }, { status: "finalized" });
  await AuditLog.create({ actor: req.user._id, action: "FINALIZE_PAYROLL", details: month });
  res.json({ success: true, modified: r.modifiedCount });
};

export const listPayroll = async (req, res) => {
  const filter = req.query.month ? { month: req.query.month } : {};
  const payroll = await Payroll.find(filter).populate("user", "name department");
  res.json({ success: true, payroll });
};

// Employee: apni finalized payslips
export const myPayslips = async (req, res) => {
  const payslips = await Payroll.find({ user: req.user._id, status: "finalized" }).sort("-month");
  res.json({ success: true, payslips });
};

export const auditLogs = async (req, res) => {
  const logs = await AuditLog.find().populate("actor", "name").sort("-createdAt").limit(200);
  res.json({ success: true, logs });
};