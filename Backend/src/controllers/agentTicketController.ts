import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { addTicketMessage, getAgentTicket } from "../services/ticketService.js";
import { emitToTicket } from "../socket/socketServer.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateCategory,
  validateMessage,
  validatePriority,
  validateResolutionNote,
  validateStatus,
  validateSummary,
} from "../utils/ticketValidation.js";

const requireAgent = (req: AuthenticatedRequest) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user;
};

export const getAgentTickets = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const agent = requireAgent(req);
  const tickets = await Ticket.find({ assignedAgent: agent._id }).sort({ createdAt: -1 }).populate("customer", "name email role");
  res.json({ success: true, data: { tickets } });
});

export const getAgentTicketById = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const agent = requireAgent(req);
  const ticket = await getAgentTicket(req.params.ticketId ?? "", agent._id);
  await ticket.populate([{ path: "customer", select: "name email role" }, { path: "assignedAgent", select: "name email role" }]);
  res.json({ success: true, data: { ticket } });
});

export const getAgentTicketMessages = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const agent = requireAgent(req);
  const ticket = await getAgentTicket(req.params.ticketId ?? "", agent._id);
  const messages = await Message.find({ ticket: ticket._id }).sort({ createdAt: 1 }).populate("sender", "name role");
  res.json({ success: true, data: { messages } });
});

export const updateTriage = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const agent = requireAgent(req);
  const ticket = await getAgentTicket(req.params.ticketId ?? "", agent._id);
  if (ticket.status === "Resolved") throw new AppError(409, "Resolved tickets cannot be changed");

  const category = validateCategory(req.body?.category);
  if (!category) throw new AppError(400, "Category is required");
  ticket.finalTriage = {
    category,
    priority: validatePriority(req.body?.priority),
    summary: validateSummary(req.body?.summary),
    reviewedBy: agent._id,
    reviewedAt: new Date(),
  };
  await ticket.save();
  res.json({ success: true, data: { ticket } });
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const agent = requireAgent(req);
  const ticket = await getAgentTicket(req.params.ticketId ?? "", agent._id);
  const nextStatus = validateStatus(req.body?.status);

  if (ticket.status === "Resolved") throw new AppError(409, "Resolved tickets cannot be changed");
  if (nextStatus === "Resolved") throw new AppError(400, "Use the resolve endpoint to resolve a ticket");

  const allowedNext = ticket.status === "New" ? "Assigned" : ticket.status === "Assigned" ? "In Progress" : null;
  if (nextStatus !== allowedNext) {
    throw new AppError(409, `Cannot change ticket status from ${ticket.status} to ${nextStatus}`);
  }

  ticket.status = nextStatus;
  await ticket.save();
  emitToTicket(ticket._id.toString(), "ticket:status-updated", {
    ticketId: ticket._id.toString(),
    status: ticket.status,
    updatedAt: ticket.updatedAt,
  });
  res.json({ success: true, data: { ticket } });
});

export const postAgentMessage = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const agent = requireAgent(req);
  const ticket = await getAgentTicket(req.params.ticketId ?? "", agent._id);
  const message = validateMessage(req.body?.message);
  const createdMessage = await addTicketMessage(ticket, agent._id, "agent", message);
  emitToTicket(ticket._id.toString(), "message:new", createdMessage.toObject());
  res.status(201).json({ success: true, data: { message: createdMessage } });
});

export const resolveTicket = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const agent = requireAgent(req);
  const ticket = await getAgentTicket(req.params.ticketId ?? "", agent._id);
  if (ticket.status === "Resolved") throw new AppError(409, "Ticket is already resolved");
  if (ticket.status !== "In Progress") throw new AppError(409, "Only an in-progress ticket can be resolved");

  ticket.resolutionNote = validateResolutionNote(req.body?.resolutionNote);
  ticket.status = "Resolved";
  ticket.resolvedAt = new Date();
  await ticket.save();
  emitToTicket(ticket._id.toString(), "ticket:resolved", {
    ticketId: ticket._id.toString(),
    status: ticket.status,
    resolutionNote: ticket.resolutionNote,
    resolvedAt: ticket.resolvedAt,
    updatedAt: ticket.updatedAt,
  });
  res.json({ success: true, data: { ticket } });
});
