import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import { Toaster } from "sonner";
import { useTheme } from "../theme/ThemeContext";

export function AppToaster() {
  const { theme } = useTheme();

  return <Toaster
    theme={theme}
    position="top-right"
    duration={3500}
    visibleToasts={3}
    closeButton
    richColors
    icons={{
      success: <CheckCircle2 size={18} aria-hidden="true" />,
      error: <CircleAlert size={18} aria-hidden="true" />,
      warning: <AlertTriangle size={18} aria-hidden="true" />,
      info: <Info size={18} aria-hidden="true" />,
    }}
    toastOptions={{ className: "app-toast" }}
  />;
}
