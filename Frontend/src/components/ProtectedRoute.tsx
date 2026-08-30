import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import { Loader } from "./UI";

export function ProtectedRoute() {
  const { user, loading } = useAuth(); const location = useLocation();
  if (loading) return <Loader fullPage label="Checking your session…" />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
export function RoleRoute({ role }: { role: Role }) { const { user } = useAuth(); return user?.role === role ? <Outlet /> : <Navigate to="/unauthorized" replace />; }
