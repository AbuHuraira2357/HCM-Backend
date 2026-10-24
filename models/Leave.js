import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, default: "casual" },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  days: Number,
  reason: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);