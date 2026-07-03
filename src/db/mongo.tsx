import mongoose from "mongoose";

const MONGODB_URI = "mongodb://127.0.0.1:27017/";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalObj = global as unknown as { mongoose?: MongooseCache };

if (!globalObj.mongoose) {
  globalObj.mongoose = { conn: null, promise: null };
}

const cached = globalObj.mongoose;

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "aiChatSupport",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
