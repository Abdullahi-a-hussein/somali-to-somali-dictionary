"use client";

import { useState, useEffect } from "react";

const DARK_MODE_KEY = "darkModePreference";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false); // default to false

  // 1. Initialize from localStorage or system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPreference = localStorage.getItem(DARK_MODE_KEY);
      if (storedPreference !== null) {
        setIsDarkMode(storedPreference === "true");
      } else {
        const systemPreference = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDarkMode(systemPreference);
      }
    }
  }, []);

  // 2. Apply the 'dark' class and save preference whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;

      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());
    }
  }, [isDarkMode]);

  // 3. Toggle handler
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return [isDarkMode, toggleDarkMode];
}
