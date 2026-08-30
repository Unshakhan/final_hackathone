import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "../constants/ticket.js";

export interface TriageData {
  category: TicketCategory;
  priority: TicketPriority;
  summary: string;
}

export interface AiSuggestion extends TriageData {
  status: "pending_review";
  source?: "ai" | "fallback";
}

export interface FinalTriage extends TriageData {
  reviewedBy: Types.ObjectId;
  reviewedAt: Date;
}

export interface ITicket {
  ticketNumber: string;
  customer: Types.ObjectId;
  assignedAgent?: Types.ObjectId | null;
  subject: string;
  description: string;
  customerSelectedCategory?: TicketCategory;
  aiSuggestion?: AiSuggestion;
  finalTriage?: FinalTriage;
  status: TicketStatus;
  resolutionNote?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TicketDocument = HydratedDocument<ITicket>;

const aiSuggestionSchema = new Schema<AiSuggestion>(
  {
    category: { type: String, enum: TICKET_CATEGORIES, required: true },
    priority: { type: String, enum: TICKET_PRIORITIES, required: true },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: ["pending_review"], required: true },
    source: { type: String, enum: ["ai", "fallback"] },
  },
  { _id: false },
);

const finalTriageSchema = new Schema<FinalTriage>(
  {
    category: { type: String, enum: TICKET_CATEGORIES, required: true },
    priority: { type: String, enum: TICKET_PRIORITIES, required: true },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewedAt: { type: Date, required: true },
  },
  { _id: false },
);

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, immutable: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    customerSelectedCategory: { type: String, enum: TICKET_CATEGORIES },
    aiSuggestion: { type: aiSuggestionSchema, default: undefined },
    finalTriage: { type: finalTriageSchema, default: undefined },
    status: { type: String, enum: TICKET_STATUSES, default: "New", index: true },
    resolutionNote: { type: String, trim: true, maxlength: 2000 },
    resolvedAt: Date,
  },
  { timestamps: true },
);

const Ticket = model<ITicket>("Ticket", ticketSchema);

export default Ticket;
