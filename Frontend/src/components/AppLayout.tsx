import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Headphones, LayoutDashboard, LifeBuoy, LogOut, Menu, Plus, Ticket, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem { label: string; path: string; icon: LucideIcon }
const customerLinks: NavItem[] = [
  { label: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
  { label: "My tickets", path: "/customer/tickets", icon: Ticket },
  { label: "Create ticket", path: "/customer/tickets/new", icon: Plus },
];
const agentLinks: NavItem[] = [
  { label: "Dashboard", path: "/agent/dashboard", icon: LayoutDashboard },
  { label: "Assigned tickets", path: "/agent/tickets", icon: Ticket },
];

export function AppLayout() {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const links = user?.role === "agent" ? agentLinks : customerLinks;
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><span className="brand-mark"><Headphones size={19} aria-hidden="true" /></span><span>Supportly</span><button className="sidebar-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={19} /></button></div>
      <span className="nav-label">Workspace</span>
      <nav aria-label="Main navigation">{links.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><Icon size={18} strokeWidth={1.9} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-help"><LifeBuoy size={20} aria-hidden="true" /><div><span>Support workspace</span><small>Every request, organized and in reach.</small></div></div>
    </aside>
    <AnimatePresence>{open && <motion.button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}</AnimatePresence>
    <div className="main-shell">
      <header className="topbar"><button className="icon-button menu-button" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20} /></button><div className="topbar-spacer" /><ThemeToggle /><div className="user-meta"><span className="avatar">{user?.name.charAt(0).toUpperCase()}</span><span><strong>{user?.name}</strong><small>{user?.role === "agent" ? "Support agent" : "Customer"}</small></span></div><button className="logout-button" onClick={logout}><LogOut size={17} aria-hidden="true" /><span>Log out</span></button></header>
      <motion.main className="page-content" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28, ease: "easeOut" }}><Outlet /></motion.main>
    </div>
  </div>;
}
