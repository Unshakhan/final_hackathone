import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const customerLinks = [["Dashboard", "/customer/dashboard", "⌂"], ["My tickets", "/customer/tickets", "◫"], ["Create ticket", "/customer/tickets/new", "+"]];
const agentLinks = [["Dashboard", "/agent/dashboard", "⌂"], ["Assigned tickets", "/agent/tickets", "◫"]];

export function AppLayout() {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false);
  const links = user?.role === "agent" ? agentLinks : customerLinks;
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><span className="brand-mark">S</span><span>Supportly</span></div>
      <nav aria-label="Main navigation">{links.map(([label, path, icon]) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><span>{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-help"><span>Need a hand?</span><small>Keep every support request organized in one place.</small></div>
    </aside>
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <div className="main-shell"><header className="topbar"><button className="menu-button" aria-label="Open navigation" onClick={() => setOpen(true)}>☰</button><div className="topbar-spacer" /><div className="user-meta"><span className="avatar">{user?.name.charAt(0).toUpperCase()}</span><span><strong>{user?.name}</strong><small>{user?.role === "agent" ? "Support agent" : "Customer"}</small></span></div><button className="text-button" onClick={logout}>Log out</button></header><main className="page-content"><Outlet /></main></div>
  </div>;
}
