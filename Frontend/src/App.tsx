import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { AgentDashboard, CustomerDashboard } from "./pages/DashboardPages";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { AgentTicketDetailsPage, CustomerTicketDetailsPage } from "./pages/TicketDetailsPages";
import { AgentTicketsPage, CustomerTicketsPage } from "./pages/TicketListPages";
import { NewTicketPage } from "./pages/NewTicketPage";
import { NotFoundPage, UnauthorizedPage } from "./pages/UtilityPages";
import "./App.css";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? `/${user.role}/dashboard` : "/login"} replace />;
}

function App() {
  return <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route element={<RoleRoute role="customer" />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/tickets" element={<CustomerTicketsPage />} />
          <Route path="/customer/tickets/new" element={<NewTicketPage />} />
          <Route path="/customer/tickets/:ticketId" element={<CustomerTicketDetailsPage />} />
        </Route>
        <Route element={<RoleRoute role="agent" />}>
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/tickets" element={<AgentTicketsPage />} />
          <Route path="/agent/tickets/:ticketId" element={<AgentTicketDetailsPage />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}

export default App;
