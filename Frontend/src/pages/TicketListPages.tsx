import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { api, apiErrorMessage } from "../api/client";
import { EmptyState, ErrorState, Loader, PriorityBadge, StatusBadge } from "../components/UI";
import type { ApiEnvelope, Role, Ticket, TicketPriority, TicketStatus, User } from "../types";

const priorityOf = (ticket: Ticket) => ticket.finalTriage?.priority || ticket.aiSuggestion?.priority;
const personName = (person: User | string | null | undefined) => typeof person === "object" && person ? person.name : person ? "Assigned support" : "Unassigned";
const MotionLink = motion.create(Link);

function TicketList({ role }: { role: Role }) {
  const reduceMotion = useReducedMotion();
  const [tickets, setTickets] = useState<Ticket[] | null>(null); const [error, setError] = useState("");
  const [status, setStatus] = useState<"All" | TicketStatus>("All"); const [priority, setPriority] = useState<"All" | TicketPriority>("All");
  const load = useCallback(async () => { setError(""); try { const path = role === "customer" ? "/api/tickets/my" : "/api/agent/tickets"; const response = await api.get<ApiEnvelope<{ tickets: Ticket[] }>>(path); setTickets(response.data.data.tickets); } catch (requestError) { setError(apiErrorMessage(requestError)); } }, [role]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const filtered = useMemo(() => (tickets || []).filter((ticket) => (status === "All" || ticket.status === status) && (priority === "All" || priorityOf(ticket) === priority)), [tickets, status, priority]);
  if (error) return <ErrorState message={error} retry={() => void load()} />;
  if (!tickets) return <Loader label="Loading tickets…" />;
  const customer = role === "customer";
  return <div className="page-stack"><header className="page-header"><div><span className="eyebrow">Ticket workspace</span><h1>{customer ? "My tickets" : "Assigned tickets"}</h1><p>{customer ? "View every request and its latest progress." : "Prioritize, review, and resolve your assigned requests."}</p></div>{customer && <Link className="button primary" to="/customer/tickets/new">+ Create ticket</Link>}</header>
    {role === "agent" && <div className="filters"><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option>All</option><option>New</option><option>Assigned</option><option>In Progress</option><option>Resolved</option></select></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)}><option>All</option><option>Low</option><option>Medium</option><option>High</option></select></label><span>{filtered.length} ticket{filtered.length === 1 ? "" : "s"}</span></div>}
    {!filtered.length ? <EmptyState title="No tickets here" message={tickets.length ? "No tickets match the selected filters." : customer ? "Create your first request and our team will take it from there." : "Your assigned queue is clear."} action={customer && !tickets.length ? <Link className="button primary" to="/customer/tickets/new">Create ticket</Link> : undefined} /> : <div className="ticket-list">{filtered.map((ticket, index) => <MotionLink to={`/${role}/tickets/${ticket._id}`} className="ticket-row" key={ticket._id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .035, .25), duration: .22 }}><div className="ticket-main"><div className="ticket-number">{ticket.ticketNumber}</div><h3>{ticket.subject}</h3><p>{ticket.description}</p></div><div className="ticket-meta"><div><StatusBadge status={ticket.status} /><PriorityBadge priority={priorityOf(ticket)} /></div><span>{customer ? `Agent: ${personName(ticket.assignedAgent)}` : `Customer: ${personName(ticket.customer)}`}</span><time>{new Date(ticket.createdAt).toLocaleDateString()}</time></div></MotionLink>)}</div>}
  </div>;
}
export const CustomerTicketsPage = () => <TicketList role="customer" />;
export const AgentTicketsPage = () => <TicketList role="agent" />;
