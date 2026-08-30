import type { ReactNode } from "react";
import type { TicketPriority, TicketStatus } from "../types";

export function Loader({ fullPage = false, label = "Loading…" }: { fullPage?: boolean; label?: string }) { return <div className={fullPage ? "loader full-page" : "loader"}><span className="spinner" /><span>{label}</span></div>; }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) { return <div className="state-box error-state"><strong>Something went wrong</strong><p>{message}</p>{retry && <button className="button secondary" onClick={retry}>Try again</button>}</div>; }
export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) { return <div className="state-box empty-state"><div className="empty-icon">✦</div><strong>{title}</strong><p>{message}</p>{action}</div>; }
export function StatusBadge({ status }: { status: TicketStatus }) { return <span className={`badge status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>; }
export function PriorityBadge({ priority }: { priority?: TicketPriority }) { return <span className={`badge priority-${(priority || "Low").toLowerCase()}`}>{priority || "Low"}</span>; }
export function StatCard({ label, value, tone = "blue" }: { label: string; value: number; tone?: string }) { return <article className={`stat-card tone-${tone}`}><span>{label}</span><strong>{value}</strong></article>; }
export function Notice({ type, children }: { type: "success" | "error"; children: ReactNode }) { return <div className={`notice ${type}`} role="status">{children}</div>; }
