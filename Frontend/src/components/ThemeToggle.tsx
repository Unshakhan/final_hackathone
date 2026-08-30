import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../theme/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return <motion.button className="icon-button theme-toggle" type="button" aria-label={label} title={label} onClick={toggleTheme} whileHover={reduceMotion ? undefined : { scale: 1.06 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }}>
    {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
  </motion.button>;
}
