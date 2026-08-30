import { Bot, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Ticket, User } from "../types";
import { PriorityBadge, StatusBadge } from "./UI";

const nameOf = (person: User | string | null | undefined) => typeof person === "object" && person ? person.name : "Not assigned";
export function TicketSummary({ ticket, agentView = false }: { ticket: Ticket; agentView?: boolean }) {
  const active = ticket.finalTriage || ticket.aiSuggestion;
  const reduceMotion = useReducedMotion();
  return <>
    <motion.section className="ticket-hero" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div><span className="ticket-number">{ticket.ticketNumber}</span><h1>{ticket.subject}</h1><p>Created {new Date(ticket.createdAt).toLocaleString()}</p></div><div className="hero-badges"><StatusBadge status={ticket.status} /><PriorityBadge priority={active?.priority} /></div></motion.section>
    <section className="details-grid"><article className="panel description-card"><h2>Customer request</h2><p className="ticket-description">{ticket.description}</p><dl><div><dt>Customer category</dt><dd>{ticket.customerSelectedCategory || "Not selected"}</dd></div><div><dt>{agentView ? "Customer" : "Assigned agent"}</dt><dd>{nameOf(agentView ? ticket.customer : ticket.assignedAgent)}</dd></div></dl></article><motion.article className="panel triage-summary" initial={reduceMotion ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .08 }}><span className="triage-icon"><Bot size={20} /></span><span className="eyebrow">Current triage</span><h2>{active?.category || "Awaiting triage"}</h2><p>{active?.summary || "A triage summary has not been added yet."}</p>{ticket.finalTriage ? <span className="review-label human"><ShieldCheck size={14} />Final human review</span> : <span className="review-label ai"><Bot size={14} />AI suggestion · pending review</span>}</motion.article></section>
    {ticket.status === "Resolved" && <motion.section className="panel resolution-card" initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}><CheckCircle2 size={20} /><div><span className="eyebrow">Resolution</span><h2>Ticket resolved</h2><p>{ticket.resolutionNote}</p>{ticket.resolvedAt && <time>{new Date(ticket.resolvedAt).toLocaleString()}</time>}</div></motion.section>}
  </>;
}
