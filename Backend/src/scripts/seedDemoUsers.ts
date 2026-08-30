import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import User, { type UserRole } from "../models/User.js";

dotenv.config();

const demoUsers: Array<{ name: string; email: string; role: UserRole }> = [
  { name: "Demo Customer", email: "customer@demo.com", role: "customer" },
  { name: "Demo Agent", email: "agent@demo.com", role: "agent" },
];

const seedDemoUsers = async (): Promise<void> => {
  try {
    await connectDatabase();

    for (const demoUser of demoUsers) {
      const existing = await User.exists({ email: demoUser.email });
      if (existing) {
        console.log(`${demoUser.role} demo account already exists; no changes made.`);
        continue;
      }

      await User.create({ ...demoUser, password: "Demo123!" });
      console.log(`${demoUser.role} demo account created.`);
    }
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoUsers().catch((error: unknown) => {
  console.error("Failed to seed demo accounts:", error);
  process.exitCode = 1;
});
