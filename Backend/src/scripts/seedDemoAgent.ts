import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const seedDemoAgent = async (): Promise<void> => {
  try {
    await connectDatabase();

    const email = "agent@demo.com";
    const existingAgent = await User.findOne({ email });
    if (existingAgent) {
      console.log("Demo agent already exists; no changes made.");
      return;
    }

    await User.create({
      name: "Demo Agent",
      email,
      password: "Demo123!",
      role: "agent",
    });
    console.log("Demo agent created.");
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoAgent().catch((error: unknown) => {
  console.error("Failed to seed demo agent:", error);
  process.exitCode = 1;
});
