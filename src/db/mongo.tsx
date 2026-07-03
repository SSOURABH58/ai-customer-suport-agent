import mongoose from "mongoose";

// Default to local MongoDB running inside the same container.
// Override via MONGODB_URI environment variable only if needed (e.g. Atlas).
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/";

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = await mongoose.connect(MONGODB_URI, {
      dbName: "aiChatSupport",
    });
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;

  return cached.conn;
}
