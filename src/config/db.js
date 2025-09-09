import mongoose from "mongoose";

export async function connectToDatabase(uri) {
  try {
    mongoose.set("strictQuery", true);
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}
