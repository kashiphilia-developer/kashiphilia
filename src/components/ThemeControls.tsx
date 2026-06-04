"use client";

import { useEffect, useMemo, useState } from "react";

const THEME_KEY = "kashiphilia.theme.mode";
const AUTO_KEY = "kashiphilia.theme.auto";

type ThemeMode = "light" | "dark";

function getAutoTheme(): ThemeMode {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  if (hour < 5 || hour > 19 || (hour === 19 && minute >= 30)) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeControls() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [autoMode, setAutoMode] = useState(false);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const lightPeriod = { from: "05:00", to: "19:30" };
  const darkPeriod = { from: "19:30", to: "05:00" };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedAuto = localStorage.getItem(AUTO_KEY) === "true";
    const storedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;

    if (storedAuto) {
      setAutoMode(true);
      const computed = getAutoTheme();
      setTheme(computed);
      applyTheme(computed);
      return;
    }

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      applyTheme(storedTheme);
      return;
    }

    setTheme("light");
    applyTheme("light");
  }, []);

  useEffect(() => {
    if (!autoMode) return;
    const interval = window.setInterval(() => {
      const computed = getAutoTheme();
      setTheme(computed);
      applyTheme(computed);
    }, 60000);
    return () => window.clearInterval(interval);
  }, [autoMode]);

  const toggleTheme = () => {
    if (autoMode) return;
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  };

  const toggleAutoMode = () => {
    const nextAuto = !autoMode;
    setAutoMode(nextAuto);
    localStorage.setItem(AUTO_KEY, String(nextAuto));

    if (nextAuto) {
      const computed = getAutoTheme();
      setTheme(computed);
      applyTheme(computed);
    } else {
      localStorage.setItem(THEME_KEY, theme);
    }
  };

  const themeLabel = theme === "light" ? "Light" : "Dark";
  const autoLabel = autoMode ? "Auto theme enabled" : "Auto theme";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        disabled={autoMode}
        className="btn-secondary"
        aria-label="Toggle light and dark theme"
      >
        {autoMode
          ? "Theme locked to schedule"
          : `Switch to ${theme === "light" ? "dark" : "light"}`}
      </button>
      <button
        type="button"
        onClick={toggleAutoMode}
        className={`btn-primary ${autoMode ? "opacity-90" : ""}`}
        aria-pressed={autoMode}
        aria-label="Toggle auto theme based on local time"
      >
        {autoMode ? "Auto theme on" : "Auto theme"}
      </button>
      <span className="text-xs text-slate-500">{themeLabel} mode</span>
      {autoMode && (
        <div className="w-full text-xs mt-1" style={{ color: "var(--muted)" }}>
          Auto theme ON — now: {formatTime(new Date())}. Light:{" "}
          {lightPeriod.from}–{lightPeriod.to}; Dark: {darkPeriod.from}–
          {darkPeriod.to}.
        </div>
      )}
    </div>
  );
}
