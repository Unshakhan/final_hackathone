import { useCallback, useEffect, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../socket/client";
import type { ApiEnvelope, TicketMessage, User } from "../types";
import { EmptyState, Notice } from "./UI";

const senderName = (sender: User | string, role: string) => typeof sender === "object" ? sender.name : role === "agent" ? "Support agent" : "Customer";
export function Conversation({ ticketId, basePath, resolved }: { ticketId: string; basePath: string; resolved: boolean }) {
  const reduceMotion = useReducedMotion();
  const { user } = useAuth(); const [messages, setMessages] = useState<TicketMessage[]>([]); const [text, setText] = useState(""); const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { setError(""); try { const response = await api.get<ApiEnvelope<{ messages: TicketMessage[] }>>(`${basePath}/${ticketId}/messages`); setMessages(response.data.data.messages); } catch (requestError) { setError(apiErrorMessage(requestError)); } finally { setLoading(false); } }, [basePath, ticketId]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const receive = (message: TicketMessage & { ticket?: string }) => {
      if (message.ticket && message.ticket !== ticketId) return;
      setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
    };
    socket.on("message:new", receive);
    return () => { socket.off("message:new", receive); };
  }, [ticketId]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!text.trim()) return setError("Message cannot be empty."); setSending(true); setError(""); try { await api.post(`${basePath}/${ticketId}/messages`, { message: text.trim() }); setText(""); await load(); } catch (requestError) { setError(apiErrorMessage(requestError)); } finally { setSending(false); } };
  return <section className="panel conversation"><div className="panel-heading"><div><h2>Conversation</h2><p>Messages are saved with this ticket.</p></div></div>{error && <Notice type="error">{error}</Notice>}{loading ? <div className="message-skeleton">Loading conversation…</div> : !messages.length ? <EmptyState title="No messages yet" message="Start the conversation with a helpful update." /> : <div className="messages">{messages.map((message) => { const own = message.senderRole === user?.role; return <motion.div className={`message ${own ? "own" : ""}`} key={message._id} initial={reduceMotion ? false : { opacity: 0, y: 5, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }}><div className="message-head"><strong>{own ? "You" : senderName(message.sender, message.senderRole)}</strong><time>{new Date(message.createdAt).toLocaleString()}</time></div><p>{message.message}</p></motion.div>; })}</div>}{resolved ? <div className="resolved-note">This ticket is resolved. New messages are disabled.</div> : <form className="message-form" onSubmit={submit}><label className="sr-only" htmlFor="message">Message</label><textarea id="message" rows={3} value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message…" maxLength={5000} /><button className="button primary" disabled={sending || !text.trim()}>{sending ? "Sending…" : "Send message"}</button></form>}</section>;
}
