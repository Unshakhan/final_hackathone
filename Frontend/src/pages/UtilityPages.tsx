import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Utility({ code, title, message }: { code: string; title: string; message: string }) { const { user } = useAuth(); return <div className="utility-page"><div className="brand"><span className="brand-mark">S</span><span>Supportly</span></div><strong className="utility-code">{code}</strong><h1>{title}</h1><p>{message}</p><Link className="button primary" to={user ? `/${user.role}/dashboard` : "/login"}>Go to dashboard</Link></div>; }
export const UnauthorizedPage = () => <Utility code="403" title="Access not available" message="Your account role does not have permission to view this page." />;
export const NotFoundPage = () => <Utility code="404" title="Page not found" message="The page you were looking for does not exist or has moved." />;
