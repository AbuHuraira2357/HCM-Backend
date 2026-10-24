import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "hr", "employee"], default: "employee" },
  department: String,
  designation: String,
  basicSalary: { type: Number, default: 0 },
  leaveBalance: { type: Number, default: 20 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
