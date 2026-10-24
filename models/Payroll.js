import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // YYYY-MM
  basicSalary: Number,
  presentDays: Number,
  absentDays: Number,
  deduction: Number,
  netSalary: Number,
  status: { type: String, enum: ["draft", "finalized"], default: "draft" },
}, { timestamps: true });

payrollSchema.index({ user: 1, month: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);