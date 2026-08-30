import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { ErrorState, Loader, StatCard } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import type { ApiEnvelope, DashboardData, Role } from "../types";

function Dashboard({ role }: { role: Role }) {
  const { user } = useAuth(); const [data, setData] = useState<DashboardData | null>(null); const [error, setError] = useState("");
  const load = useCallback(async () => { setError(""); try { const response = await api.get<ApiEnvelope<DashboardData>>(`/api/dashboard/${role}`); setData(response.data.data); } catch (requestError) { setError(apiErrorMessage(requestError)); } }, [role]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  if (error) return <ErrorState message={error} retry={() => void load()} />;
  if (!data) return <Loader label="Loading dashboard…" />;
  const isCustomer = role === "customer";
  return <div className="page-stack"><header className="page-header"><div><span className="eyebrow">Overview</span><h1>Welcome back, {user?.name.split(" ")[0]}</h1><p>{isCustomer ? "Track your requests and get help when you need it." : "Review your queue and keep customer requests moving."}</p></div><Link className="button primary" to={isCustomer ? "/customer/tickets/new" : "/agent/tickets"}>{isCustomer ? "+ Create ticket" : "Open queue"}</Link></header>
    <section className="stats-grid"><StatCard label="Total tickets" value={data.total} tone="blue" /><StatCard label="New" value={data.statusCounts.New} tone="slate" /><StatCard label="In progress" value={data.statusCounts["In Progress"]} tone="amber" /><StatCard label="Resolved" value={data.statusCounts.Resolved} tone="green" /></section>
    <section className="panel"><div className="panel-heading"><div><h2>Priority overview</h2><p>Current workload grouped by reviewed or suggested priority.</p></div></div><div className="priority-overview"><div><span className="priority-dot high" /><p><strong>{data.priorityCounts.High}</strong> High priority</p></div><div><span className="priority-dot medium" /><p><strong>{data.priorityCounts.Medium}</strong> Medium priority</p></div><div><span className="priority-dot low" /><p><strong>{data.priorityCounts.Low}</strong> Low priority</p></div></div></section>
  </div>;
}
export const CustomerDashboard = () => <Dashboard role="customer" />;
export const AgentDashboard = () => <Dashboard role="agent" />;
