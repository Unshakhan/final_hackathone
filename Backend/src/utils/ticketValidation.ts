import { isValidObjectId } from "mongoose";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "../constants/ticket.js";
import { AppError } from "./AppError.js";

const requiredText = (value: unknown, field: string, min: number, max: number): string => {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new AppError(400, `${field} must be between ${min} and ${max} characters`);
  }
  return value.trim();
};

export const validateTicketId = (value: unknown): string => {
  if (typeof value !== "string" || !isValidObjectId(value)) throw new AppError(400, "Invalid ticket id");
  return value;
};

export const validateSubject = (value: unknown): string => requiredText(value, "Subject", 3, 150);
export const validateDescription = (value: unknown): string => requiredText(value, "Description", 10, 5000);
export const validateSummary = (value: unknown): string => requiredText(value, "Summary", 3, 500);
export const validateMessage = (value: unknown): string => requiredText(value, "Message", 1, 5000);
export const validateResolutionNote = (value: unknown): string => requiredText(value, "Resolution note", 3, 2000);

export const validateCategory = (value: unknown, optional = false): TicketCategory | undefined => {
  if (optional && (value === undefined || value === null || value === "")) return undefined;
  if (typeof value !== "string" || !TICKET_CATEGORIES.includes(value as TicketCategory)) {
    throw new AppError(400, `Category must be one of: ${TICKET_CATEGORIES.join(", ")}`);
  }
  return value as TicketCategory;
};

export const validatePriority = (value: unknown): TicketPriority => {
  if (typeof value !== "string" || !TICKET_PRIORITIES.includes(value as TicketPriority)) {
    throw new AppError(400, `Priority must be one of: ${TICKET_PRIORITIES.join(", ")}`);
  }
  return value as TicketPriority;
};

export const validateStatus = (value: unknown): TicketStatus => {
  if (typeof value !== "string" || !TICKET_STATUSES.includes(value as TicketStatus)) {
    throw new AppError(400, `Status must be one of: ${TICKET_STATUSES.join(", ")}`);
  }
  return value as TicketStatus;
};
