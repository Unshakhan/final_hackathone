export type Role = "customer" | "agent";
export type TicketStatus = "New" | "Assigned" | "In Progress" | "Resolved";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketCategory = "Billing" | "Technical" | "Account" | "Refund" | "General";

export interface User { id?: string; _id?: string; name: string; email?: string; role: Role }
export interface Triage { category: TicketCategory; priority: TicketPriority; summary: string; status?: "pending_review"; reviewedBy?: string; reviewedAt?: string }
export interface Ticket {
  _id: string; ticketNumber: string; customer: User | string; assignedAgent?: User | string | null;
  subject: string; description: string; customerSelectedCategory?: TicketCategory; aiSuggestion?: Triage;
  finalTriage?: Triage; status: TicketStatus; resolutionNote?: string; resolvedAt?: string;
  createdAt: string; updatedAt: string;
}
export interface TicketMessage { _id: string; sender: User | string; senderRole: Role; message: string; createdAt: string }
export interface DashboardData { total: number; statusCounts: Record<TicketStatus, number>; priorityCounts: Record<TicketPriority, number> }
export interface ApiEnvelope<T> { success: boolean; data: T; message?: string }
