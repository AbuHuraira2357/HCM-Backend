import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

// .env ko app.js ke barabar wali file se load karo (terminal kahin se bhi chale)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const result = dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Looking for .env at:", path.join(__dirname, ".env"));
console.log("dotenv error:", result.error ? result.error.message : "none");
console.log("MONGODB_URI loaded?", !!process.env.MONGODB_URI);
console.log("JWT_SECRET loaded?", !!process.env.JWT_SECRET);

const app = express();
app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    console.error("DB ERROR:", e.message);
    res.status(500).json({ success: false, message: "DB connection failed", error: e.message });
  }
});

app.get("/", (req, res) => res.json({ success: true, message: "HCM Lite API is running" }));
app.use("/api", routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;