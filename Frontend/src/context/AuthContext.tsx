import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, TOKEN_KEY, USER_KEY } from "../api/client";
import { connectSocket, disconnectSocket } from "../socket/client";
import type { ApiEnvelope, User } from "../types";

interface AuthValue { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; register: (name: string, email: string, password: string) => Promise<User>; logout: () => void }
const AuthContext = createContext<AuthValue | null>(null);
const savedUser = (): User | null => { try { const value = localStorage.getItem(USER_KEY); return value ? JSON.parse(value) as User : null; } catch { return null; } };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(savedUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const logout = () => { disconnectSocket(); localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setUser(null); };
  const save = (nextUser: User, token: string) => { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(nextUser)); connectSocket(token); setUser(nextUser); return nextUser; };

  useEffect(() => {
    const validate = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) { setLoading(false); return; }
      try { const response = await api.get<ApiEnvelope<{ user: User }>>("/api/auth/me"); const token = localStorage.getItem(TOKEN_KEY); if (token) connectSocket(token); localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user)); setUser(response.data.data.user); }
      catch { logout(); } finally { setLoading(false); }
    };
    void validate();
    const unauthorized = () => logout();
    window.addEventListener("supportdesk:unauthorized", unauthorized);
    return () => window.removeEventListener("supportdesk:unauthorized", unauthorized);
  }, []);

  const login = async (email: string, password: string) => { const response = await api.post<ApiEnvelope<{ user: User; token: string }>>("/api/auth/login", { email, password }); return save(response.data.data.user, response.data.data.token); };
  const register = async (name: string, email: string, password: string) => { const response = await api.post<ApiEnvelope<{ user: User; token: string }>>("/api/auth/register", { name, email, password }); return save(response.data.data.user, response.data.data.token); };
  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be inside AuthProvider"); return value; }
