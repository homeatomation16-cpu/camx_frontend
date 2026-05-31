"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../theme-provider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Safely delay state changes to an asynchronous callback to avoid cascading renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Return a structural placeholder block during server-side pre-rendering execution passes
  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-gray-800 bg-neutral-50 dark:bg-[#111827]" />;
  }

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-gray-800 bg-neutral-50 dark:bg-[#111827] flex items-center justify-center text-neutral-700 dark:text-gray-300 hover:border-secondary hover:text-secondary transition duration-300 cursor-pointer" title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"} aria-label="Toggle Theme Mode">
      {theme === "dark" ? <Sun size={18} className="animate-fadeIn" /> : <Moon size={18} className="animate-fadeIn" />}
    </button>
  );
}
