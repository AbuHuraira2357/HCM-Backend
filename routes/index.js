import { Router } from "express";
import { protect, allow } from "../middleware/auth.js";
import * as auth from "../controllers/authController.js";
import * as user from "../controllers/userController.js";
import * as att from "../controllers/attendanceController.js";
import * as leave from "../controllers/leaveController.js";
import * as pay from "../controllers/payrollController.js";
import { stats } from "../controllers/dashboardController.js";

const r = Router();

// Auth
r.post("/auth/setup-admin", auth.setupAdmin);
r.post("/auth/login", auth.login);
r.get("/auth/me", protect, auth.me);

// Users
r.post("/users", protect, allow("admin", "hr"), user.createUser);
r.get("/users", protect, allow("admin", "hr"), user.listUsers);
r.put("/users/:id", protect, allow("admin", "hr"), user.updateUser);
r.patch("/users/:id/toggle", protect, allow("admin", "hr"), user.toggleActive);

// Attendance
r.post("/attendance/check-in", protect, att.checkIn);
r.post("/attendance/check-out", protect, att.checkOut);
r.get("/attendance/me", protect, att.myAttendance);
r.get("/attendance", protect, allow("admin", "hr"), att.allAttendance);
r.post("/attendance/mark", protect, allow("hr"), att.markAttendance);

// Leaves
r.post("/leaves", protect, allow("employee"), leave.applyLeave);
r.get("/leaves/me", protect, leave.myLeaves);
r.get("/leaves", protect, allow("admin", "hr"), leave.allLeaves);
r.patch("/leaves/:id/review", protect, allow("hr"), leave.reviewLeave);

// Payroll
r.post("/payroll/prepare", protect, allow("hr"), pay.preparePayroll);
r.post("/payroll/finalize", protect, allow("admin"), pay.finalizePayroll);
r.get("/payroll", protect, allow("admin", "hr"), pay.listPayroll);
r.get("/payroll/me", protect, pay.myPayslips);
r.get("/audit-logs", protect, allow("admin"), pay.auditLogs);

// Dashboard
r.get("/dashboard/stats", protect, allow("admin", "hr"), stats);

export default r;