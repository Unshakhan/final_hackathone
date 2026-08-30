import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Bot } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { Conversation } from "../components/Conversation";
import { TicketSummary } from "../components/TicketSummary";
import { ErrorState, Loader, Notice } from "../components/UI";
import { useTicketRealtime, type SocketState } from "../hooks/useTicketRealtime";
import type { ApiEnvelope, Ticket, TicketCategory, TicketPriority } from "../types";

function useTicket(path: string, ticketId?: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { if (!ticketId) return; setError(""); try { const response = await api.get<ApiEnvelope<{ ticket: Ticket }>>(`${path}/${ticketId}`); setTicket(response.data.data.ticket); } catch (requestError) { setError(apiErrorMessage(requestError)); } finally { setLoading(false); } }, [path, ticketId]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  return { ticket, error, loading, load };
}

export function CustomerTicketDetailsPage() {
  const { ticketId } = useParams(); const state = useTicket("/api/tickets", ticketId);
  const socketState = useTicketRealtime(ticketId, state.load);
  if (state.loading) return <Loader label="Loading ticket…" />;
  if (state.error || !state.ticket) return <ErrorState message={state.error || "Ticket not found."} retry={() => void state.load()} />;
  return <div className="page-stack"><div className="detail-topline"><Link className="back-link" to="/customer/tickets"><ArrowLeft size={15} />Back to my tickets</Link><ConnectionState status={socketState} /></div><TicketSummary ticket={state.ticket} /><Conversation ticketId={state.ticket._id} basePath="/api/tickets" resolved={state.ticket.status === "Resolved"} /></div>;
}

const categories: TicketCategory[] = ["Billing", "Technical", "Account", "Refund", "General"];
const priorities: TicketPriority[] = ["Low", "Medium", "High"];
export function AgentTicketDetailsPage() {
  const { ticketId } = useParams(); const state = useTicket("/api/agent/tickets", ticketId);
  const socketState = useTicketRealtime(ticketId, state.load);
  const [triage, setTriage] = useState<{ category: TicketCategory; priority: TicketPriority; summary: string } | null>(null);
  const [reviewing, setReviewing] = useState(false); const [statusLoading, setStatusLoading] = useState(false); const [resolveOpen, setResolveOpen] = useState(false); const [resolutionNote, setResolutionNote] = useState(""); const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  if (state.loading) return <Loader label="Loading assigned ticket…" />;
  if (state.error || !state.ticket) return <ErrorState message={state.error || "Assigned ticket not found."} retry={() => void state.load()} />;
  const ticket = state.ticket; const resolved = ticket.status === "Resolved";
  const sourceTriage = ticket.finalTriage || ticket.aiSuggestion;
  if (!triage && sourceTriage) setTriage({ category: sourceTriage.category, priority: sourceTriage.priority, summary: sourceTriage.summary });
  const saveTriage = async (event: FormEvent) => { event.preventDefault(); if (!triage) return; setReviewing(true); setNotice(null); try { await api.patch(`/api/agent/tickets/${ticket._id}/triage`, triage); setNotice({ type: "success", text: "Human review saved." }); await state.load(); } catch (requestError) { setNotice({ type: "error", text: apiErrorMessage(requestError) }); } finally { setReviewing(false); } };
  const nextStatus = ticket.status === "New" ? "Assigned" : ticket.status === "Assigned" ? "In Progress" : null;
  const advance = async () => { if (!nextStatus) return; setStatusLoading(true); setNotice(null); try { await api.patch(`/api/agent/tickets/${ticket._id}/status`, { status: nextStatus }); setNotice({ type: "success", text: `Ticket moved to ${nextStatus}.` }); await state.load(); } catch (requestError) { setNotice({ type: "error", text: apiErrorMessage(requestError) }); } finally { setStatusLoading(false); } };
  const resolve = async (event: FormEvent) => { event.preventDefault(); if (resolutionNote.trim().length < 3) return setNotice({ type: "error", text: "Resolution note must contain at least 3 characters." }); setStatusLoading(true); setNotice(null); try { await api.post(`/api/agent/tickets/${ticket._id}/resolve`, { resolutionNote: resolutionNote.trim() }); setResolveOpen(false); setNotice({ type: "success", text: "Ticket resolved successfully." }); await state.load(); } catch (requestError) { setNotice({ type: "error", text: apiErrorMessage(requestError) }); } finally { setStatusLoading(false); } };
  return <div className="page-stack"><div className="detail-topline"><Link className="back-link" to="/agent/tickets"><ArrowLeft size={15} />Back to assigned tickets</Link><ConnectionState status={socketState} /></div>{notice && <Notice type={notice.type}>{notice.text}</Notice>}<TicketSummary ticket={ticket} agentView />
    <section className="agent-workspace"><article className="panel"><div className="panel-heading"><div><span className="review-label ai"><Bot size={14} />AI Suggestion</span><h2>Suggested triage</h2></div></div>{ticket.aiSuggestion ? <div className="suggestion-box"><div><span>Category</span><strong>{ticket.aiSuggestion.category}</strong></div><div><span>Priority</span><strong>{ticket.aiSuggestion.priority}</strong></div><p>{ticket.aiSuggestion.summary}</p></div> : <p className="muted">No AI suggestion was stored.</p>}</article>
      <article className="panel"><div className="panel-heading"><div><span className="review-label human">Human review</span><h2>Final triage</h2></div></div>{triage && <form className="form-stack compact" onSubmit={saveTriage}><div className="two-columns"><label>Category<select value={triage.category} disabled={resolved} onChange={(event) => setTriage({ ...triage, category: event.target.value as TicketCategory })}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label><label>Priority<select value={triage.priority} disabled={resolved} onChange={(event) => setTriage({ ...triage, priority: event.target.value as TicketPriority })}>{priorities.map((value) => <option key={value}>{value}</option>)}</select></label></div><label>Summary<textarea rows={4} value={triage.summary} disabled={resolved} onChange={(event) => setTriage({ ...triage, summary: event.target.value })} /></label><button className="button primary" disabled={reviewing || resolved}>{reviewing ? "Saving…" : ticket.finalTriage ? "Update review" : "Save human review"}</button></form>}</article>
    </section>
    <section className="panel action-panel"><div><h2>Ticket workflow</h2><p>Move this ticket through the approved support workflow.</p></div><div className="workflow-actions">{nextStatus && <button className="button secondary" disabled={statusLoading} onClick={() => void advance()}>Move to {nextStatus}</button>}{ticket.status === "In Progress" && <button className="button danger" disabled={statusLoading} onClick={() => setResolveOpen(true)}>Resolve ticket</button>}{resolved && <span className="resolved-note">No further actions available</span>}</div></section>
    {resolveOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="resolve-title"><h2 id="resolve-title">Resolve ticket</h2><p>Add a clear note explaining how the request was resolved.</p><form className="form-stack" onSubmit={resolve}><label>Resolution note<textarea autoFocus rows={5} value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} required /></label><div className="form-actions"><button type="button" className="button secondary" onClick={() => setResolveOpen(false)}>Cancel</button><button className="button danger" disabled={statusLoading}>{statusLoading ? "Resolving…" : "Confirm resolution"}</button></div></form></section></div>}
    <Conversation ticketId={ticket._id} basePath="/api/agent/tickets" resolved={resolved} />
  </div>;
}

function ConnectionState({ status }: { status: SocketState }) {
  if (status === "connected") return null;
  return <span className={`socket-state ${status}`}><i />{status === "reconnecting" ? "Live updates reconnecting…" : "Live updates disconnected"}</span>;
}
