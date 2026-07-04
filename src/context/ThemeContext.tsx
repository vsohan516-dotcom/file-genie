import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPref, setPref } from "@/services/preferences";
import type { AccentName, ThemeMode } from "@/types/files";

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentName;
  resolvedDark: boolean;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PREF_MODE = "smartfiles.theme.mode";
const PREF_ACCENT = "smartfiles.theme.accent";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accent, setAccentState] = useState<AccentName>("green");
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    getPref<ThemeMode>(PREF_MODE, "system").then(setModeState);
    getPref<AccentName>(PREF_ACCENT, "green").then(setAccentState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const resolvedDark = mode === "system" ? systemDark : mode === "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedDark);
    root.dataset.accent = accent;
    root.style.colorScheme = resolvedDark ? "dark" : "light";
  }, [resolvedDark, accent]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      accent,
      resolvedDark,
      setMode: (m) => {
        setModeState(m);
        void setPref(PREF_MODE, m);
      },
      setAccent: (a) => {
        setAccentState(a);
        void setPref(PREF_ACCENT, a);
      },
    }),
    [mode, accent, resolvedDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const v = useContext(ThemeContext);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}
