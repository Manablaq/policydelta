"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid size-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Moon
        size={17}
        aria-hidden="true"
        className="block dark:hidden"
      />

      <Sun
        size={17}
        aria-hidden="true"
        className="hidden dark:block"
      />
    </button>
  );
}
