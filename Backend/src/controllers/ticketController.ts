import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { getTriageSuggestion } from "../services/aiTriageService.js";
import { addTicketMessage, createTicketNumber, findAvailableAgent, getCustomerTicket } from "../services/ticketService.js";
import { emitToTicket } from "../socket/socketServer.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateCategory,
  validateDescription,
  validateMessage,
  validateSubject,
} from "../utils/ticketValidation.js";

const requireUser = (req: AuthenticatedRequest) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user;
};

export const createTicket = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req);
  const subject = validateSubject(req.body?.subject);
  const description = validateDescription(req.body?.description);
  const customerSelectedCategory = validateCategory(req.body?.customerSelectedCategory, true);
  const assignedAgent = await findAvailableAgent();
  const suggestion = await getTriageSuggestion(subject, description);

  const ticket = await Ticket.create({
    ticketNumber: createTicketNumber(),
    customer: user._id,
    assignedAgent,
    subject,
    description,
    ...(customerSelectedCategory ? { customerSelectedCategory } : {}),
    aiSuggestion: { ...suggestion, status: "pending_review" },
    status: assignedAgent ? "Assigned" : "New",
  });

  res.status(201).json({ success: true, data: { ticket } });
});

export const getMyTickets = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req);
  const tickets = await Ticket.find({ customer: user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { tickets } });
});

export const getMyTicket = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req);
  const ticket = await getCustomerTicket(req.params.ticketId ?? "", user._id);
  await ticket.populate([{ path: "assignedAgent", select: "name email role" }, { path: "customer", select: "name email role" }]);
  res.json({ success: true, data: { ticket } });
});

export const getMyTicketMessages = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req);
  const ticket = await getCustomerTicket(req.params.ticketId ?? "", user._id);
  const messages = await Message.find({ ticket: ticket._id }).sort({ createdAt: 1 }).populate("sender", "name role");
  res.json({ success: true, data: { messages } });
});

export const postCustomerMessage = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req);
  const ticket = await getCustomerTicket(req.params.ticketId ?? "", user._id);
  const message = validateMessage(req.body?.message);
  const createdMessage = await addTicketMessage(ticket, user._id, "customer", message);
  emitToTicket(ticket._id.toString(), "message:new", createdMessage.toObject());
  res.status(201).json({ success: true, data: { message: createdMessage } });
});
