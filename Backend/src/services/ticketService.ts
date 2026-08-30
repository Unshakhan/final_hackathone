import { randomUUID } from "node:crypto";
import type { Types } from "mongoose";
import Message from "../models/Message.js";
import Ticket, { type TicketDocument } from "../models/Ticket.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { validateTicketId } from "../utils/ticketValidation.js";

export const createTicketNumber = (): string =>
  `TKT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const findAvailableAgent = async (): Promise<Types.ObjectId | null> => {
  const demoAgent = await User.findOne({ email: "agent@demo.com", role: "agent" }).select("_id");
  if (demoAgent) return demoAgent._id;
  const agent = await User.findOne({ role: "agent" }).sort({ createdAt: 1 }).select("_id");
  return agent?._id ?? null;
};

export const getCustomerTicket = async (ticketId: unknown, customerId: Types.ObjectId): Promise<TicketDocument> => {
  const validatedId = validateTicketId(ticketId);
  const ticket = await Ticket.findOne({ _id: validatedId, customer: customerId });
  if (!ticket) throw new AppError(404, "Ticket not found");
  return ticket;
};

export const getAgentTicket = async (ticketId: unknown, agentId: Types.ObjectId): Promise<TicketDocument> => {
  const validatedId = validateTicketId(ticketId);
  const ticket = await Ticket.findOne({ _id: validatedId, assignedAgent: agentId });
  if (!ticket) throw new AppError(404, "Assigned ticket not found");
  return ticket;
};

export const addTicketMessage = async (
  ticket: TicketDocument,
  sender: Types.ObjectId,
  senderRole: "customer" | "agent",
  message: string,
) => {
  if (ticket.status === "Resolved") throw new AppError(409, "Resolved tickets cannot receive new messages");
  return Message.create({ ticket: ticket._id, sender, senderRole, message });
};
