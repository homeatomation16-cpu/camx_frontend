"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({ theme: "light", setTheme: () => {} });

// Safe client-side state initializer block avoids inline synchronous setState inside effects
const getInitialTheme = (): string => {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem("theme") || "light";
  } catch (e) {
    console.error("Theme local storage lookup exception:", e);
    return "light";
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Initialize state directly from the helper to avoid cascading hook renders
  const [theme, setThemeState] = useState<string>(getInitialTheme);

  // Synchronize layout document classes safely with the active theme context on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (e) {
      console.error("Failed to commit theme to localStorage:", e);
    }
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </ThemeContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useTheme = () => useContext(ThemeContext);
