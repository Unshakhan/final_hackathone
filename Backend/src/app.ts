import cors from "cors";
import express from "express";
import { isClientOriginAllowed } from "./config/cors.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import agentTicketRoutes from "./routes/agentTicketRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

const app = express();

app.use(cors({
  origin: (origin, callback) => callback(null, isClientOriginAllowed(origin)),
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Backend is working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/agent", agentTicketRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
