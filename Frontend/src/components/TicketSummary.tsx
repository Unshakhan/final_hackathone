import type { Ticket, User } from "../types";
import { PriorityBadge, StatusBadge } from "./UI";

const nameOf = (person: User | string | null | undefined) => typeof person === "object" && person ? person.name : "Not assigned";
export function TicketSummary({ ticket, agentView = false }: { ticket: Ticket; agentView?: boolean }) {
  const active = ticket.finalTriage || ticket.aiSuggestion;
  return <>
    <section className="ticket-hero"><div><span className="ticket-number">{ticket.ticketNumber}</span><h1>{ticket.subject}</h1><p>Created {new Date(ticket.createdAt).toLocaleString()}</p></div><div className="hero-badges"><StatusBadge status={ticket.status} /><PriorityBadge priority={active?.priority} /></div></section>
    <section className="details-grid"><article className="panel description-card"><h2>Customer request</h2><p className="ticket-description">{ticket.description}</p><dl><div><dt>Customer category</dt><dd>{ticket.customerSelectedCategory || "Not selected"}</dd></div><div><dt>{agentView ? "Customer" : "Assigned agent"}</dt><dd>{nameOf(agentView ? ticket.customer : ticket.assignedAgent)}</dd></div></dl></article><article className="panel triage-summary"><span className="eyebrow">Current triage</span><h2>{active?.category || "Awaiting triage"}</h2><p>{active?.summary || "A triage summary has not been added yet."}</p>{ticket.finalTriage ? <span className="review-label human">✓ Final human review</span> : <span className="review-label ai">✦ AI suggestion · pending review</span>}</article></section>
    {ticket.status === "Resolved" && <section className="panel resolution-card"><span className="eyebrow">Resolution</span><h2>Ticket resolved</h2><p>{ticket.resolutionNote}</p>{ticket.resolvedAt && <time>{new Date(ticket.resolvedAt).toLocaleString()}</time>}</section>}
  </>;
}
