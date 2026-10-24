import mongoose from "mongoose";

let cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI .env mein nahi mila");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .catch((err) => {
        cached.promise = null; // fail hone par dobara try kar sake
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}