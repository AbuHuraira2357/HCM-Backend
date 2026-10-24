import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  details: String,
}, { timestamps: true });

export default mongoose.model("AuditLog", auditSchema);