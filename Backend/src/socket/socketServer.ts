import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import Ticket from "../models/Ticket.js";
import User, { type UserRole } from "../models/User.js";
import { verifyToken } from "../utils/auth.js";
import { validateTicketId } from "../utils/ticketValidation.js";

interface SocketUser {
  userId: string;
  role: UserRole;
}

let io: Server | null = null;
const roomName = (ticketId: string) => `ticket:${ticketId}`;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== "string" || !token) return next(new Error("Authentication required"));

      const payload = verifyToken(token);
      const user = await User.findById(payload.userId).select("role");
      if (!user) return next(new Error("Authentication failed"));

      socket.data.user = { userId: user._id.toString(), role: user.role } satisfies SocketUser;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ticket:join", async (payload: unknown, acknowledge?: (result: { success: boolean; message?: string }) => void) => {
      try {
        if (typeof payload !== "object" || payload === null || !("ticketId" in payload)) throw new Error("Invalid ticket id");
        const ticketId = validateTicketId((payload as { ticketId: unknown }).ticketId);
        const socketUser = socket.data.user as SocketUser;
        const access = socketUser.role === "customer"
          ? { _id: ticketId, customer: socketUser.userId }
          : { _id: ticketId, assignedAgent: socketUser.userId };
        const ticket = await Ticket.exists(access);
        if (!ticket) throw new Error("Ticket access denied");

        await socket.join(roomName(ticketId));
        acknowledge?.({ success: true });
      } catch (error) {
        acknowledge?.({ success: false, message: error instanceof Error ? error.message : "Unable to join ticket" });
      }
    });

    socket.on("ticket:leave", (payload: unknown) => {
      if (typeof payload === "object" && payload !== null && "ticketId" in payload) {
        const ticketId = (payload as { ticketId: unknown }).ticketId;
        if (typeof ticketId === "string") void socket.leave(roomName(ticketId));
      }
    });
  });

  return io;
};

export const emitToTicket = (ticketId: string, event: string, payload: unknown): void => {
  io?.to(roomName(ticketId)).emit(event, payload);
};
