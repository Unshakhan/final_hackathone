export const TICKET_CATEGORIES = ["Billing", "Technical", "Account", "Refund", "General"] as const;
export const TICKET_PRIORITIES = ["Low", "Medium", "High"] as const;
export const TICKET_STATUSES = ["New", "Assigned", "In Progress", "Resolved"] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
