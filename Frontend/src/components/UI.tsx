import { AlertCircle, Inbox, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import type { TicketPriority, TicketStatus } from "../types";

export function Loader({ fullPage = false, label = "Loading…" }: { fullPage?: boolean; label?: string }) {
  return <div className={fullPage ? "loader full-page" : "loader"} role="status"><span className="spinner" /><span>{label}</span></div>;
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <motion.div className="state-box error-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="state-icon error"><AlertCircle size={22} /></span><strong>Something went wrong</strong><p>{message}</p>{retry && <button className="button secondary" onClick={retry}><RotateCcw size={15} />Try again</button>}</motion.div>;
}
export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <motion.div className="state-box empty-state" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}><span className="state-icon"><Inbox size={22} /></span><strong>{title}</strong><p>{message}</p>{action}</motion.div>;
}
export function StatusBadge({ status }: { status: TicketStatus }) { return <span className={`badge status-${status.toLowerCase().replaceAll(" ", "-")}`}><i />{status}</span>; }
export function PriorityBadge({ priority }: { priority?: TicketPriority }) { return <span className={`badge priority-${(priority || "Low").toLowerCase()}`}><i />{priority || "Low"}</span>; }
export function StatCard({ label, value, tone = "blue" }: { label: string; value: number; tone?: string }) {
  const reduceMotion = useReducedMotion();
  return <motion.article className={`stat-card tone-${tone}`} whileHover={reduceMotion ? undefined : { y: -3 }} transition={{ duration: .18 }}><span>{label}</span><strong>{value}</strong><div className="stat-glow" /></motion.article>;
}
export function Notice({ type, children }: { type: "success" | "error"; children: ReactNode }) { return <motion.div className={`notice ${type}`} role="status" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>; }
