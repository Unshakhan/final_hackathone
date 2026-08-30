import "./config/env.js";
import { createServer } from "node:http";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { initializeSocket } from "./socket/socketServer.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log("MongoDB connected");

    const httpServer = createServer(app);
    initializeSocket(httpServer);
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

void startServer();
