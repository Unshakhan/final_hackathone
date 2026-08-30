import { useState, type FormEvent, type ReactNode } from "react";
import { Check, Headphones } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import { Notice } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { toast } from "sonner";

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return <div className="auth-page"><section className="auth-visual"><div className="brand light"><span className="brand-mark"><Headphones size={19} /></span><span>Supportly</span></div><div><span className="eyebrow light">Customer care, simplified</span><h1>Resolve every request with clarity.</h1><p>AI-assisted triage, thoughtful human support, and every conversation in one calm workspace.</p></div><div className="auth-proof"><span><Check size={16} /></span><p><strong>Fast, organized support</strong><br />Built for customers and support teams.</p></div></section><section className="auth-panel"><div className="auth-theme-toggle"><ThemeToggle /></div><div className="auth-card"><span className="eyebrow">Welcome to Supportly</span><h2>{title}</h2><p className="muted">{subtitle}</p>{children}<div className="auth-footer">{footer}</div></div></section></div>;
}

export function LoginPage() {
  const { user, login } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); setLoading(true); try { const next = await login(email.trim(), password); toast.success("Welcome back.", { id: "login-success" }); navigate(`/${next.role}/dashboard`, { replace: true }); } catch (requestError) { const message = apiErrorMessage(requestError); setError(message); toast.error(message, { id: "login-error" }); } finally { setLoading(false); } };
  return <AuthShell title="Sign in to your account" subtitle="Enter your details to continue to your support workspace." footer={<>New to Supportly? <Link to="/register">Create an account</Link></>}>
    {error && <Notice type="error">{error}</Notice>}<form onSubmit={submit} className="form-stack"><label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" /></label><button className="button primary wide" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form>
    <button className="demo-login" type="button" disabled={loading} onClick={() => { setEmail("agent@demo.com"); setPassword("Demo123!"); }}>Use demo agent credentials</button>
  </AuthShell>;
}

export function RegisterPage() {
  const { user, register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" }); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); if (form.name.trim().length < 2) return setError("Name must contain at least 2 characters."); if (form.password.length < 8 || !/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) return setError("Password needs 8+ characters with uppercase, lowercase, and a number."); setLoading(true); try { const next = await register(form.name.trim(), form.email.trim(), form.password); toast.success("Account created successfully.", { id: "registration-success" }); navigate(`/${next.role}/dashboard`, { replace: true }); } catch (requestError) { const message = apiErrorMessage(requestError); setError(message); toast.error(message, { id: "registration-error" }); } finally { setLoading(false); } };
  return <AuthShell title="Create your customer account" subtitle="Submit, track, and resolve support requests in one place." footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
    {error && <Notice type="error">{error}</Notice>}<form onSubmit={submit} className="form-stack"><label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoComplete="name" placeholder="Your full name" /></label><label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoComplete="email" placeholder="you@example.com" /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoComplete="new-password" placeholder="At least 8 characters" /></label><button className="button primary wide" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button></form>
  </AuthShell>;
}
